import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { filterPublik } from "@/lib/queries";
import { keTeksPolos } from "@/lib/sanitasi";
import { Foto } from "@/components/Foto";
import { KartuBerita } from "@/components/publik/KartuBerita";
import { Kicker } from "@/components/publik/Kerangka";
import { TombolBagikan } from "@/components/publik/TombolBagikan";
import { HitungDibaca } from "@/components/publik/HitungDibaca";
import { tanggalPanjang } from "@/lib/util";

// Konten dikelola admin dan harus langsung tampil setelah disimpan.
// Render dinamis: query Postgres lokal murah untuk trafik satu desa,
// dan menghindari halaman basi akibat cache ISR.
export const dynamic = "force-dynamic";

const ambil = (slug: string) =>
  prisma.berita.findFirst({
    where: { slug, ...filterPublik() },
    include: {
      kategori: { select: { nama: true, slug: true } },
      penulis: { select: { nama: true } },
    },
  });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const berita = await ambil(slug);
  if (!berita) return { title: "Berita tidak ditemukan" };

  return {
    title: berita.judul,
    description: berita.ringkasan || keTeksPolos(berita.isi),
    alternates: { canonical: `/berita/${berita.slug}` },
    openGraph: {
      type: "article",
      title: berita.judul,
      description: berita.ringkasan,
      publishedTime: berita.tanggalTerbit?.toISOString(),
      images: berita.gambarSampul ? [berita.gambarSampul] : undefined,
    },
  };
}

export default async function DetailBerita({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const berita = await ambil(slug);
  if (!berita) notFound();

  const terkait = await prisma.berita.findMany({
    where: {
      ...filterPublik(),
      kategoriId: berita.kategoriId,
      id: { not: berita.id },
    },
    orderBy: { tanggalTerbit: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      judul: true,
      gambarSampul: true,
      tanggalTerbit: true,
      kategori: { select: { nama: true } },
    },
  });

  return (
    <>
      <HitungDibaca slug={berita.slug} />
      {/* Padding bawah: kalau berita ini tidak punya "Berita terkait",
          artikel tidak boleh menempel langsung ke footer. */}
      <article
        style={{
          padding: `56px var(--pad) ${terkait.length > 0 ? 0 : "72px"}`,
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            fontSize: 13,
            color: "var(--color-neutral-700)",
            margin: "0 0 24px",
          }}
        >
          <Link href="/">Beranda</Link>
          <span style={{ margin: "0 6px" }}>/</span>
          <Link href="/berita">Berita</Link>
          <span style={{ margin: "0 6px" }}>/</span>
          {berita.judul.slice(0, 40)}…
        </nav>

        <div style={{ maxWidth: 840 }}>
          <Link
            href={`/berita?kategori=${berita.kategori.slug}`}
            className="tag tag-accent"
          >
            {berita.kategori.nama}
          </Link>
          <h1
            style={{
              fontSize: 46,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "20px 0 0 -0.045em",
            }}
          >
            {berita.judul}
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              marginTop: 24,
              padding: "16px 0",
              borderTop: "2px solid var(--color-divider)",
              borderBottom: "2px solid var(--color-divider)",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 14, color: "var(--color-neutral-800)" }}>
              Ditulis oleh <strong>{berita.penulis.nama}</strong> ·{" "}
              {tanggalPanjang(berita.tanggalTerbit)} · {berita.dibaca} dibaca
            </span>
            <TombolBagikan judul={berita.judul} />
          </div>
        </div>

        <figure style={{ margin: "40px 0 0" }}>
          {/* Utuh: foto kegiatan warga kehilangan isinya kalau dipotong
              (wajah peserta di tepi ikut terbuang). */}
          <Foto
            src={berita.gambarSampul}
            alt={`Foto: ${berita.judul}`}
            tinggi={620}
            priority
            sizes="100vw"
            utuh
          />
        </figure>

        {/* Isi sudah disanitasi saat disimpan (lihat lib/sanitasi.ts). */}
        <div
          className="artikel"
          style={{ maxWidth: 720, margin: "48px auto 0" }}
          dangerouslySetInnerHTML={{ __html: berita.isi }}
        />

        {/* Diberi garis pemisah + label supaya tidak menempel pada paragraf
            terakhir maupun pada blok "Berita terkait" di bawahnya. */}
        {berita.tags.length > 0 && (
          <div
            style={{
              maxWidth: 720,
              margin: "48px auto 0",
              paddingTop: 24,
              paddingBottom: 8,
              borderTop: "2px solid var(--color-divider)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--color-neutral-700)",
                marginRight: 4,
              }}
            >
              Tag
            </span>
            {berita.tags.map((t) => (
              <span key={t} className="tag tag-outline">
                {t}
              </span>
            ))}
          </div>
        )}
      </article>

      {terkait.length > 0 && (
        <section
          style={{
            padding: "56px var(--pad) 72px",
            marginTop: 56,
            borderTop: "2px solid var(--color-divider)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 24,
            }}
          >
            <Kicker>Berita terkait</Kicker>
            <Link href="/berita" style={{ fontSize: 14 }}>
              Semua berita →
            </Link>
          </div>
          <div
            className="grid-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
          >
            {terkait.map((b) => (
              <KartuBerita
                key={b.id}
                berita={b}
                tinggiFoto={170}
                ringkasan={false}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
