import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  arsipBulan,
  daftarBerita,
  filterPublik,
  kategoriDenganJumlah,
  pengumumanTerbaru,
} from "@/lib/queries";
import { beritaQuerySchema } from "@/lib/validasi";
import { Kicker } from "@/components/publik/Kerangka";
import { KartuBerita } from "@/components/publik/KartuBerita";
import { Paginasi } from "@/components/publik/Paginasi";
import { Foto } from "@/components/Foto";
import { namaBulan, tanggalPanjang } from "@/lib/util";

// Konten dikelola admin dan harus langsung tampil setelah disimpan.
// Render dinamis: query Postgres lokal murah untuk trafik satu desa,
// dan menghindari halaman basi akibat cache ISR.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Berita Desa",
  description:
    "Kabar terbaru dari Pemerintah Desa Garangan — kegiatan, pembangunan, pertanian, dan layanan warga.",
  alternates: { canonical: "/berita" },
};

const PER_HALAMAN = 6;

export default async function HalamanBerita({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Query string tetap divalidasi — nilai aneh jatuh ke default, bukan error.
  const parsed = beritaQuerySchema.safeParse(sp);
  const { page, q, kategori, bulan } = parsed.success
    ? parsed.data
    : { page: 1, q: undefined, kategori: undefined, bulan: undefined };

  const [hasil, kategoriList, arsip, pengumuman, terpopuler, total] =
    await Promise.all([
      daftarBerita({
        page,
        perPage: PER_HALAMAN,
        q,
        kategori,
        bulan,
        publik: true,
      }),
      kategoriDenganJumlah(),
      arsipBulan(),
      pengumumanTerbaru(1),
      prisma.berita.findMany({
        where: filterPublik(),
        orderBy: { dibaca: "desc" },
        take: 4,
        select: { id: true, slug: true, judul: true, dibaca: true },
      }),
      prisma.berita.count({ where: filterPublik() }),
    ]);

  const adaFilter = Boolean(q || kategori || bulan);
  // Artikel unggulan hanya di halaman 1 tanpa filter, seperti desain.
  const unggulan = !adaFilter && page === 1 ? hasil.items[0] : null;
  const sisa = unggulan ? hasil.items.slice(1) : hasil.items;
  const disematkan = pengumuman.find((p) => p.disematkan);

  const buatHref = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (kategori) u.set("kategori", kategori);
    if (bulan) u.set("bulan", bulan);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/berita?${s}` : "/berita";
  };

  return (
    <>
      <section
        style={{
          padding: "56px var(--pad) 40px",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 20 }}
        >
          <Link href="/">Beranda</Link>
          <span style={{ margin: "0 6px" }}>/</span>Berita
        </nav>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              className="hero-title"
              style={{
                fontSize: 56,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                margin: "0 0 0 -0.058em",
              }}
            >
              Berita Desa
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: "26px",
                color: "var(--color-neutral-800)",
                margin: "16px 0 0",
                maxWidth: "52ch",
              }}
            >
              {total} artikel dari pemerintah desa — kegiatan, pembangunan, dan
              kabar warga Garangan.
            </p>
          </div>
          {/* Form GET: pencarian jalan tanpa JavaScript. */}
          <form className="field" style={{ minWidth: 320 }} action="/berita">
            <label htmlFor="cari">Cari berita</label>
            <input
              id="cari"
              className="input"
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Kata kunci, mis. posyandu"
            />
            {kategori && <input type="hidden" name="kategori" value={kategori} />}
          </form>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          <Link
            href={q ? `/berita?q=${encodeURIComponent(q)}` : "/berita"}
            className={`tag ${!kategori ? "tag-accent" : "tag-outline"}`}
          >
            Semua ({total})
          </Link>
          {kategoriList.map((k) => (
            <Link
              key={k.id}
              href={`/berita?kategori=${k.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`tag ${kategori === k.slug ? "tag-accent" : "tag-outline"}`}
            >
              {k.nama} ({k.jumlah})
            </Link>
          ))}
        </div>
      </section>

      <div
        className="split"
        style={{ display: "grid", gridTemplateColumns: "8fr 4fr" }}
      >
        <div
          style={{
            padding: "48px 48px 64px var(--pad)",
            borderRight: "2px solid var(--color-divider)",
          }}
        >
          {adaFilter && (
            <p style={{ fontSize: 14, marginBottom: 24 }}>
              {hasil.total} hasil
              {q && <> untuk “{q}”</>}
              {bulan && <> pada {bulan}</>} ·{" "}
              <Link href="/berita">Hapus filter</Link>
            </p>
          )}

          {hasil.items.length === 0 && (
            <p className="text-muted" style={{ fontSize: 15 }}>
              Tidak ada berita yang cocok. Coba kata kunci atau kategori lain.
            </p>
          )}

          {unggulan && (
            <Link
              href={`/berita/${unggulan.slug}`}
              style={{ textDecoration: "none", color: "var(--color-text)" }}
            >
              <article
                className="grid-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "6fr 6fr",
                  gap: 32,
                  border: "2px solid var(--color-divider)",
                  marginBottom: 40,
                }}
              >
                <figure style={{ margin: 0 }}>
                  <Foto
                    src={unggulan.gambarSampul}
                    alt={unggulan.judul}
                    tinggi="100%"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                </figure>
                <div style={{ padding: "28px 28px 28px 0" }}>
                  <span className="tag tag-accent">
                    {unggulan.kategori.nama}
                  </span>
                  <h2
                    style={{
                      fontSize: 30,
                      lineHeight: 1.15,
                      letterSpacing: "-0.015em",
                      margin: "16px 0 12px",
                    }}
                  >
                    {unggulan.judul}
                  </h2>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: "24px",
                      color: "var(--color-neutral-800)",
                      margin: 0,
                    }}
                  >
                    {unggulan.ringkasan}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-neutral-700)",
                      margin: "16px 0 0",
                    }}
                  >
                    {tanggalPanjang(unggulan.tanggalTerbit)} ·{" "}
                    {unggulan.penulis.nama} · {unggulan.dibaca} dibaca
                  </p>
                </div>
              </article>
            </Link>
          )}

          <div
            className="grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
            }}
          >
            {sisa.map((b) => (
              <KartuBerita
                key={b.id}
                berita={b}
                tinggiFoto={170}
                ringkasan={false}
                sizes="(max-width: 1024px) 100vw, 30vw"
              />
            ))}
          </div>

          <Paginasi
            page={hasil.page}
            totalHalaman={hasil.totalHalaman}
            buatHref={buatHref}
          />
        </div>

        <aside style={{ padding: "48px var(--pad) 64px 48px" }}>
          <Kicker style={{ marginBottom: 16 }}>Terpopuler</Kicker>
          {terpopuler.map((b, i) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                gap: 16,
                borderTop: "2px solid var(--color-divider)",
                borderBottom:
                  i === terpopuler.length - 1
                    ? "2px solid var(--color-divider)"
                    : undefined,
                padding: "16px 0",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "var(--color-accent)",
                  minWidth: 32,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <Link
                  href={`/berita/${b.slug}`}
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    lineHeight: "21px",
                    color: "var(--color-text)",
                    textDecoration: "none",
                  }}
                >
                  {b.judul}
                </Link>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--color-neutral-700)",
                    margin: "6px 0 0",
                  }}
                >
                  {b.dibaca} dibaca
                </p>
              </div>
            </div>
          ))}

          <Kicker style={{ margin: "40px 0 16px" }}>Arsip</Kicker>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 14 }}>
            {arsip.map((a, i) => {
              const [th, bl] = a.bulan.split("-").map(Number);
              return (
                <Link
                  key={a.bulan}
                  href={`/berita?bulan=${a.bulan}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderTop: "2px solid var(--color-divider)",
                    borderBottom:
                      i === arsip.length - 1
                        ? "2px solid var(--color-divider)"
                        : undefined,
                    textDecoration: "none",
                  }}
                >
                  {namaBulan(bl - 1)} {th}
                  <span style={{ color: "var(--color-neutral-700)" }}>
                    {a.jumlah}
                  </span>
                </Link>
              );
            })}
          </div>

          {disematkan && (
            <div
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                padding: 24,
                marginTop: 40,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                Pengumuman disematkan
              </span>
              <h3
                style={{
                  fontSize: 18,
                  lineHeight: 1.25,
                  margin: "10px 0 0",
                  color: "var(--color-bg)",
                }}
              >
                {disematkan.judul}
              </h3>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
