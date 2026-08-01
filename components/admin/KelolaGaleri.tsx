"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fotoTransform } from "@/lib/util";

type Foto = {
  id: string;
  urlFoto: string;
  kategori: string;
  keterangan: string;
};

const KATEGORI = [
  "Kegiatan warga",
  "Pembangunan",
  "Pertanian",
  "Perangkat desa",
  "Pemerintahan",
  "Pemandangan",
];

export function KelolaGaleri({
  foto,
  kategoriAktif,
}: {
  foto: Foto[];
  kategoriAktif?: string;
}) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  const [progres, setProgres] = useState("");

  async function unggahBanyak(files: FileList) {
    setSibuk(true);
    setPesan("");
    let berhasil = 0;

    for (const [i, file] of Array.from(files).entries()) {
      setProgres(`Mengunggah ${i + 1} dari ${files.length}…`);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "galeri");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setPesan(
          `${file.name}: ${json.detail?.[0]?.pesan ?? json.error ?? "gagal"}`,
        );
        continue;
      }

      const daftar = await fetch("/api/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlFoto: json.url,
          publicId: json.publicId,
          kategori: kategoriAktif ?? "Kegiatan warga",
          keterangan: file.name.replace(/\.[a-z]+$/i, ""),
        }),
      });
      if (daftar.ok) berhasil++;
    }

    setProgres("");
    setSibuk(false);
    if (berhasil > 0) router.refresh();
  }

  async function hapus(f: Foto) {
    if (!confirm(`Hapus foto "${f.keterangan}"?`)) return;
    const res = await fetch(`/api/galeri/${f.id}`, { method: "DELETE" });
    if (!res.ok) {
      setPesan("Gagal menghapus foto");
      return;
    }
    router.refresh();
  }

  return (
    <>
      <section
        style={{
          padding: "28px 40px",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) unggahBanyak(e.dataTransfer.files);
          }}
          style={{
            display: "block",
            border: "2px dashed var(--color-neutral-400)",
            padding: 40,
            textAlign: "center",
            background: "var(--color-neutral-100)",
            cursor: sibuk ? "wait" : "pointer",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 17,
              margin: 0,
            }}
          >
            {sibuk
              ? (progres || "Mengunggah…")
              : "Seret foto ke sini, atau klik untuk memilih file"}
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-neutral-700)",
              margin: "8px 0 0",
            }}
          >
            JPG, PNG, WebP, atau HEIC (foto iPhone), maksimal 10MB per foto. Bisa unggah banyak
            sekaligus.
          </p>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            style={{ display: "none" }}
            disabled={sibuk}
            onChange={(e) => {
              if (e.target.files?.length) unggahBanyak(e.target.files);
            }}
          />
        </label>
        {pesan && (
          <p
            role="alert"
            style={{ fontSize: 13, color: "#a11", fontWeight: 600, marginTop: 12 }}
          >
            {pesan}
          </p>
        )}
      </section>

      <section
        style={{
          padding: "24px 40px",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <a
          href="/admin/galeri"
          className={`tag ${!kategoriAktif ? "tag-accent" : "tag-outline"}`}
        >
          Semua
        </a>
        {KATEGORI.map((k) => (
          <a
            key={k}
            href={`/admin/galeri?kategori=${encodeURIComponent(k)}`}
            className={`tag ${kategoriAktif === k ? "tag-accent" : "tag-outline"}`}
          >
            {k}
          </a>
        ))}
      </section>

      <section style={{ padding: "32px 40px" }}>
        {foto.length === 0 ? (
          <p className="text-muted">Belum ada foto pada album ini.</p>
        ) : (
          <div
            className="grid-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 16,
            }}
          >
            {foto.map((f) => (
              <div key={f.id} style={{ position: "relative" }}>
                {/* Berwarna: admin perlu lihat foto apa adanya saat memilih,
                    dan halaman galeri publik juga menampilkannya berwarna. */}
                {f.urlFoto ? (
                  // `fill` + pembungkus ber-posisi: tinggi ditentukan CSS tanpa
                  // memaksa rasio lewat width/height prop (memicu peringatan).
                  <div style={{ position: "relative", height: 150 }}>
                    <Image
                      src={fotoTransform(f.urlFoto, 400)}
                      alt={f.keterangan}
                      fill
                      sizes="(max-width: 640px) 50vw, 300px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="ph" style={{ height: 150 }}>
                    {f.keterangan}
                  </div>
                )}
                <button
                  type="button"
                  aria-label={`Hapus foto ${f.keterangan}`}
                  onClick={() => hapus(f)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-neutral-400)",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-neutral-700)",
                    margin: "6px 0 0",
                  }}
                >
                  {f.keterangan}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
