import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Foto } from "@/components/Foto";

// Konten dikelola admin dan harus langsung tampil setelah disimpan.
// Render dinamis: query Postgres lokal murah untuk trafik satu desa,
// dan menghindari halaman basi akibat cache ISR.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri Desa",
  description:
    "Dokumentasi kegiatan dan wajah Desa Garangan, dari kerja bakti dusun hingga panen raya.",
  alternates: { canonical: "/galeri" },
};

const PER_HALAMAN = 12;

// Pola ubin masonry-like mengikuti desain: lebar & tinggi bervariasi.
const POLA = [
  { span: 3, tinggi: 420 },
  { span: 3, tinggi: 200 },
  { span: 2, tinggi: 200 },
  { span: 2, tinggi: 200 },
  { span: 2, tinggi: 200 },
  { span: 2, tinggi: 260 },
  { span: 2, tinggi: 260 },
  { span: 2, tinggi: 260 },
  { span: 3, tinggi: 220 },
  { span: 3, tinggi: 220 },
];

export default async function HalamanGaleri({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const kategori = typeof sp.kategori === "string" ? sp.kategori : undefined;
  const batas = Math.min(
    120,
    Math.max(PER_HALAMAN, Number(sp.tampil) || PER_HALAMAN),
  );

  const where = kategori ? { kategori } : {};
  const [foto, total, semuaKategori] = await Promise.all([
    prisma.galeri.findMany({
      where,
      orderBy: { tanggalUnggah: "desc" },
      take: batas,
    }),
    prisma.galeri.count({ where }),
    prisma.galeri.groupBy({ by: ["kategori"], _count: true }),
  ]);

  return (
    <>
      <section
        style={{
          padding: "56px var(--pad) 48px",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 20 }}
        >
          <Link href="/">Beranda</Link>
          <span style={{ margin: "0 6px" }}>/</span>Galeri
        </nav>
        <h1
          className="hero-title"
          style={{
            fontSize: 56,
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            margin: "0 0 0 -0.058em",
          }}
        >
          Galeri Desa
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: "26px",
            color: "var(--color-neutral-800)",
            margin: "16px 0 0",
            maxWidth: "56ch",
          }}
        >
          Dokumentasi kegiatan dan wajah Desa Garangan, dari kerja bakti dusun
          hingga panen raya.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          <Link
            href="/galeri"
            className={`tag ${!kategori ? "tag-accent" : "tag-outline"}`}
          >
            Semua album
          </Link>
          {semuaKategori.map((k) => (
            <Link
              key={k.kategori}
              href={`/galeri?kategori=${encodeURIComponent(k.kategori)}`}
              className={`tag ${kategori === k.kategori ? "tag-accent" : "tag-outline"}`}
            >
              {k.kategori} ({k._count})
            </Link>
          ))}
        </div>
      </section>

      <section style={{ padding: "48px var(--pad) 72px" }}>
        {foto.length === 0 ? (
          <p className="text-muted">Belum ada foto pada album ini.</p>
        ) : (
          <div
            className="grid-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 14,
            }}
          >
            {foto.map((f, i) => {
              const p = POLA[i % POLA.length];
              return (
                <figure
                  key={f.id}
                  style={{ margin: 0, gridColumn: `span ${p.span}` }}
                >
                  <Foto
                    src={f.urlFoto || null}
                    alt={f.keterangan}
                    tinggi={p.tinggi}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    warna
                  />
                </figure>
              );
            })}
          </div>
        )}

        {/* "Muat lebih banyak" sebagai tautan — tanpa JS, tetap bisa di-share. */}
        {total > foto.length && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
            <Link
              href={`/galeri?${kategori ? `kategori=${encodeURIComponent(kategori)}&` : ""}tampil=${batas + PER_HALAMAN}`}
              className="btn btn-secondary"
            >
              Muat lebih banyak
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
