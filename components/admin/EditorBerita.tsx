"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Kategori = { id: string; nama: string };
type Awal = {
  id?: string;
  judul: string;
  ringkasan: string;
  isi: string;
  kategoriId: string;
  status: "DRAF" | "TERBIT";
  gambarSampul: string | null;
  tanggalTerbit: string | null;
  tags: string[];
};

/**
 * Kerangka reportase mengikuti Template Pemberitaan KKN: piramida terbalik,
 * dengan teras 5W+1H di paragraf pertama lalu tubuh, kutipan, dan kaki berita.
 * Teks dalam kurung siku adalah petunjuk yang ditimpa penulis.
 */
/** Keterangan foto ditulis pengguna — kutip agar tidak merusak markup. */
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function kerangkaReportase() {
  const hariIni = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return `<p><strong>GARANGAN, ${hariIni}</strong> — [Teras berita: satu paragraf yang memuat siapa, melakukan apa, di mana, kapan, dan mengapa. Pembaca harus paham inti beritanya hanya dari paragraf ini.]</p>
<p>[Latar belakang: masalah atau kebutuhan di desa yang melatari kegiatan ini, serta siapa saja yang menjadi sasarannya.]</p>
<p>[Jalannya kegiatan: tahap demi tahap, dari pembukaan sampai penutup. Sebutkan jumlah peserta bila ada.]</p>
<blockquote>[Kutipan langsung dari tokoh — kepala desa, ketua kelompok, atau warga. Tulis persis seperti yang diucapkan.]</blockquote>
<p>[Sebutkan nama dan jabatan penutur kutipan di atas, mis. ujar Kepala Desa Garangan, Jamroji, di sela kegiatan.]</p>
<h2>[Subjudul untuk bagian berikutnya]</h2>
<p>[Dampak kegiatan bagi warga, tanggapan peserta, atau hasil yang sudah terlihat.]</p>
<p>[Kaki berita: harapan ke depan, rencana lanjutan, atau keterangan penutup tentang kelompok pelaksana.]</p>`;
}

/**
 * Editor rich-text minimal di atas contenteditable + document.execCommand.
 * ponytail: tanpa TipTap/Quill — toolbar desain hanya butuh 6 perintah, dan
 * HTML-nya tetap disanitasi di server. Ganti ke TipTap kalau nanti perlu
 * tabel, undo history, atau kolaborasi.
 */
function Toolbar({
  onPerintah,
  onSisipFoto,
  sedangUnggah,
}: {
  onPerintah: (c: string, v?: string) => void;
  onSisipFoto: (file: File) => void;
  sedangUnggah: boolean;
}) {
  const tombol = [
    { label: "B", cmd: "bold", gaya: { fontWeight: 800 } },
    { label: "I", cmd: "italic", gaya: { fontStyle: "italic" as const } },
    { label: "H2", cmd: "formatBlock", nilai: "h2" },
    { label: "”", cmd: "formatBlock", nilai: "blockquote" },
    { label: "• Daftar", cmd: "insertUnorderedList" },
    { label: "¶", cmd: "formatBlock", nilai: "p" },
  ];

  return (
    <div
      style={{
        border: "1px solid var(--color-neutral-400)",
        borderBottom: 0,
        display: "flex",
        gap: 4,
        padding: 8,
        background: "var(--color-neutral-200)",
        flexWrap: "wrap",
      }}
    >
      {tombol.map((t) => (
        <button
          key={t.label}
          type="button"
          className="btn btn-ghost"
          style={{ padding: "4px 10px", ...t.gaya }}
          // onMouseDown supaya seleksi teks tidak hilang saat tombol diklik.
          onMouseDown={(e) => {
            e.preventDefault();
            onPerintah(t.cmd, t.nilai);
          }}
        >
          {t.label}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-ghost"
        style={{ padding: "4px 10px" }}
        onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt("Alamat tautan (https://…)");
          if (url) onPerintah("createLink", url);
        }}
      >
        🔗
      </button>

      {/* Sisip foto ke dalam isi berita — terpisah dari gambar sampul, boleh
          berkali-kali. Label yang membungkus input file, bukan tombol, supaya
          klik langsung membuka pemilih berkas. */}
      <label
        className="btn btn-ghost"
        style={{
          padding: "4px 10px",
          cursor: sedangUnggah ? "wait" : "pointer",
          opacity: sedangUnggah ? 0.6 : 1,
        }}
      >
        {sedangUnggah ? "Mengunggah…" : "🖼 Foto"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          style={{ display: "none" }}
          disabled={sedangUnggah}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSisipFoto(f);
            // Direset agar memilih berkas yang sama dua kali tetap memicu onChange.
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

export function EditorBerita({
  awal,
  kategori,
}: {
  awal: Awal;
  kategori: Kategori[];
}) {
  const router = useRouter();
  const isiRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(awal);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  const [unggah, setUnggah] = useState(false);
  const [unggahIsi, setUnggahIsi] = useState(false);

  const ubah = <K extends keyof Awal>(k: K, v: Awal[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Isi editor diurus DOM sendiri (contentEditable), jadi cukup dipasang
  // sekali saat halaman dibuka. Sengaja tidak bergantung pada `awal.isi`
  // supaya ketikan admin tidak pernah tertimpa.
  useEffect(() => {
    if (isiRef.current) isiRef.current.innerHTML = awal.isi;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unggahSampul(file: File) {
    setUnggah(true);
    setPesan("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "berita");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUnggah(false);
    if (!res.ok) {
      setPesan(json.detail?.[0]?.pesan ?? json.error ?? "Unggah gagal");
      return;
    }
    ubah("gambarSampul", json.url);
  }

  /** Unggah foto lalu sisipkan sebagai <figure> di posisi kursor. */
  async function sisipFoto(file: File) {
    setUnggahIsi(true);
    setPesan("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "berita");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUnggahIsi(false);
    if (!res.ok) {
      setPesan(json.detail?.[0]?.pesan ?? json.error ?? "Unggah gagal");
      return;
    }

    const keterangan =
      prompt("Keterangan foto (caption) — boleh dikosongkan:")?.trim() ?? "";

    const editor = isiRef.current;
    if (!editor) return;
    editor.focus();

    // Lolos sanitasi server: figure/figcaption/img termasuk tag yang diizinkan.
    const html =
      `<figure><img src="${json.url}" alt="${escapeHtml(keterangan || "Foto kegiatan")}" />` +
      (keterangan ? `<figcaption>${escapeHtml(keterangan)}</figcaption>` : "") +
      `</figure><p><br /></p>`;

    // Sisip di kursor bila kursor memang di dalam editor; kalau tidak,
    // tambahkan di akhir supaya foto tidak hilang tanpa jejak.
    const sel = window.getSelection();
    if (sel?.rangeCount && editor.contains(sel.anchorNode)) {
      document.execCommand("insertHTML", false, html);
    } else {
      editor.insertAdjacentHTML("beforeend", html);
    }
  }

  async function simpan(status: "DRAF" | "TERBIT") {
    setSibuk(true);
    setPesan("");

    const body = {
      ...form,
      status,
      isi: isiRef.current?.innerHTML ?? form.isi,
      tanggalTerbit: form.tanggalTerbit || null,
    };

    const res = await fetch(
      form.id ? `/api/berita/${form.id}` : "/api/berita",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const json = await res.json();
    setSibuk(false);

    if (!res.ok) {
      setPesan(
        json.detail?.map((d: { pesan: string }) => d.pesan).join(" · ") ??
          json.error ??
          "Gagal menyimpan",
      );
      return;
    }
    router.push("/admin/berita");
    router.refresh();
  }

  async function hapus() {
    if (!form.id) return;
    if (!confirm(`Hapus berita "${form.judul}"? Tindakan ini permanen.`)) return;
    setSibuk(true);
    const res = await fetch(`/api/berita/${form.id}`, { method: "DELETE" });
    setSibuk(false);
    if (!res.ok) {
      setPesan("Gagal menghapus berita");
      return;
    }
    router.push("/admin/berita");
    router.refresh();
  }

  return (
    <div
      className="split"
      style={{ display: "grid", gridTemplateColumns: "8fr 4fr" }}
    >
      <div
        style={{
          padding: "32px 40px",
          borderRight: "2px solid var(--color-divider)",
          minWidth: 0,
        }}
      >
        <Link href="/admin/berita" style={{ fontSize: 13.5 }}>
          ← Kembali ke daftar
        </Link>

        <div className="field" style={{ marginTop: 24 }}>
          <label htmlFor="judul">Judul berita</label>
          <input
            id="judul"
            className="input"
            type="text"
            value={form.judul}
            onChange={(e) => ubah("judul", e.target.value)}
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 20,
              height: "auto",
              padding: "14px 16px",
            }}
          />
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="ringkasan">Ringkasan</label>
          <textarea
            id="ringkasan"
            className="input"
            rows={2}
            value={form.ringkasan}
            onChange={(e) => ubah("ringkasan", e.target.value)}
          />
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <label htmlFor="isi">Isi berita</label>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: "2px 8px", fontSize: 12.5 }}
              onClick={() => {
                const editor = isiRef.current;
                if (!editor) return;
                // Isi yang sudah ada tidak boleh hilang tanpa persetujuan.
                const adaIsi = editor.textContent?.trim();
                if (
                  adaIsi &&
                  !confirm("Ganti isi yang sudah ada dengan kerangka reportase?")
                ) {
                  return;
                }
                editor.innerHTML = kerangkaReportase();
                editor.focus();
              }}
            >
              ✎ Pakai kerangka reportase
            </button>
          </div>
          <Toolbar
            sedangUnggah={unggahIsi}
            onSisipFoto={sisipFoto}
            onPerintah={(c, v) => {
              isiRef.current?.focus();
              document.execCommand(c, false, v);
            }}
          />
          {/* Isi awal dipasang sekali lewat ref, BUKAN dangerouslySetInnerHTML.
              Regresi: dulu setiap setForm (mis. mengetik ringkasan) memicu
              render ulang, dan React menimpa isi editor kembali ke `awal.isi`
              sehingga tulisan yang sudah diketik hilang. */}
          <div
            id="isi"
            ref={isiRef}
            contentEditable
            suppressContentEditableWarning
            className="input artikel"
            style={{
              minHeight: 340,
              borderTop: 0,
              fontSize: 15.5,
              lineHeight: "26px",
              padding: 16,
              background: "var(--color-bg)",
            }}
          />
          <p
            style={{
              fontSize: 12,
              color: "var(--color-neutral-700)",
              margin: "6px 0 0",
            }}
          >
            Isi dibersihkan otomatis di server sebelum disimpan (tag berbahaya
            dibuang).
          </p>
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="tags">Tag (pisahkan dengan koma)</label>
          <input
            id="tags"
            className="input"
            type="text"
            value={form.tags.join(", ")}
            onChange={(e) =>
              ubah(
                "tags",
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            placeholder="jagung, dana desa"
          />
        </div>
      </div>

      <div style={{ padding: "32px 40px" }}>
        <span
          style={{
            display: "block",
            fontSize: 13,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--color-accent-700)",
            marginBottom: 16,
          }}
        >
          Publikasi
        </span>

        <div className="field">
          <label htmlFor="kategori">Kategori</label>
          <select
            id="kategori"
            className="input"
            value={form.kategoriId}
            onChange={(e) => ubah("kategoriId", e.target.value)}
          >
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="tanggal">Tanggal terbit</label>
          <input
            id="tanggal"
            className="input"
            type="date"
            value={form.tanggalTerbit ?? ""}
            onChange={(e) => ubah("tanggalTerbit", e.target.value || null)}
          />
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label>Gambar sampul</label>
          {form.gambarSampul ? (
            <div>
              <Image
                src={form.gambarSampul}
                alt="Pratinjau sampul"
                width={400}
                height={220}
                style={{ width: "100%", height: "auto" }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 8 }}
                onClick={() => ubah("gambarSampul", null)}
              >
                Hapus gambar
              </button>
            </div>
          ) : (
            <label
              className="ph"
              style={{
                height: 140,
                border: "1px dashed var(--color-neutral-400)",
                cursor: "pointer",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {unggah ? "Mengunggah…" : "Klik untuk unggah (JPG/PNG/HEIC, maks 10MB)"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) unggahSampul(f);
                }}
              />
            </label>
          )}
        </div>

        {pesan && (
          <p
            role="alert"
            style={{
              fontSize: 13,
              color: "#a11",
              fontWeight: 600,
              margin: "16px 0 0",
            }}
          >
            {pesan}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={sibuk}
            onClick={() => simpan("DRAF")}
          >
            Simpan draf
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={sibuk}
            onClick={() => simpan("TERBIT")}
          >
            {sibuk ? "Menyimpan…" : "Terbitkan"}
          </button>
        </div>

        {form.id && (
          <button
            type="button"
            className="btn btn-danger btn-block"
            style={{ marginTop: 12 }}
            disabled={sibuk}
            onClick={hapus}
          >
            Hapus berita
          </button>
        )}
      </div>
    </div>
  );
}
