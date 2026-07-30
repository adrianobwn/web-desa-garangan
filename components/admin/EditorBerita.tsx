"use client";

import { useRef, useState } from "react";
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
 * Editor rich-text minimal di atas contenteditable + document.execCommand.
 * ponytail: tanpa TipTap/Quill — toolbar desain hanya butuh 6 perintah, dan
 * HTML-nya tetap disanitasi di server. Ganti ke TipTap kalau nanti perlu
 * tabel, undo history, atau kolaborasi.
 */
function Toolbar({ onPerintah }: { onPerintah: (c: string, v?: string) => void }) {
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

  const ubah = <K extends keyof Awal>(k: K, v: Awal[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

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
          <label htmlFor="isi">Isi berita</label>
          <Toolbar
            onPerintah={(c, v) => {
              isiRef.current?.focus();
              document.execCommand(c, false, v);
            }}
          />
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
            dangerouslySetInnerHTML={{ __html: awal.isi }}
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
                className="grayscale"
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
              {unggah ? "Mengunggah…" : "Klik untuk unggah (JPG/PNG, maks 10MB)"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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
