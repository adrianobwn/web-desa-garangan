import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { angka, tanggalLengkap, tanggalPendek } from "@/lib/util";

export const dynamic = "force-dynamic";

// Di luar komponen: React Compiler menganggap Date.now() di badan komponen
// sebagai pembacaan tak-murni, walau ini Server Component.
async function ambilSepekanLalu() {
  return new Date(Date.now() - 7 * 864e5);
}

function Kpi({
  label,
  nilai,
  catatan,
  aksen,
  akhir,
}: {
  label: string;
  nilai: string;
  catatan: string;
  aksen?: boolean;
  akhir?: boolean;
}) {
  return (
    <div
      style={{
        padding: "28px 40px",
        borderRight: akhir ? undefined : "2px solid var(--color-divider)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "var(--color-neutral-700)",
        }}
      >
        {label}
      </span>
      <p
        className="tnum"
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: 36,
          margin: "12px 0 0",
        }}
      >
        {nilai}
      </p>
      <p
        style={{
          fontSize: 12.5,
          margin: "6px 0 0",
          color: aksen ? "var(--color-accent-700)" : "var(--color-neutral-700)",
        }}
      >
        {catatan}
      </p>
    </div>
  );
}

export default async function Dashboard() {
  const sepekanLalu = await ambilSepekanLalu();

  const [
    totalBerita,
    beritaMingguIni,
    pengumumanAktif,
    disematkan,
    totalFoto,
    album,
    terbaru,
    draf,
    pesanBelum,
    stat,
  ] = await Promise.all([
    prisma.berita.count(),
    prisma.berita.count({ where: { createdAt: { gte: sepekanLalu } } }),
    prisma.pengumuman.count(),
    prisma.pengumuman.count({ where: { disematkan: true } }),
    prisma.galeri.count(),
    prisma.galeri.groupBy({ by: ["kategori"] }),
    prisma.berita.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { kategori: { select: { nama: true } } },
    }),
    prisma.berita.count({ where: { status: "DRAF" } }),
    prisma.pesanKontak.count({ where: { statusDibalas: false } }),
    prisma.statistik.findUnique({ where: { id: "singleton" } }),
  ]);

  const perluTindakan = [
    pesanBelum > 0 && {
      judul: `${pesanBelum} pesan kontak belum dibalas`,
      sub: "Formulir kontak beranda",
      href: "/admin/pesan",
    },
    stat && {
      judul: "Perbarui statistik penduduk bila ada data baru",
      sub: `Terakhir: ${tanggalPendek(stat.terakhirDiperbarui)}`,
      href: "/admin/statistik",
    },
    draf > 0 && {
      judul: `${draf} draf berita menunggu diterbitkan`,
      sub: "Buka manajemen berita",
      href: "/admin/berita?status=DRAF",
    },
  ].filter(Boolean) as { judul: string; sub: string; href: string }[];

  return (
    <>
      <HeaderAdmin
        judul="Ringkasan"
        sub={tanggalLengkap()}
        // Tautan "Lihat situs publik" sudah ada di sidebar — jangan digandakan.
        aksi={
          <Link href="/admin/berita/baru" className="btn btn-primary">
            + Tulis berita
          </Link>
        }
      />

      <section
        className="grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <Kpi
          label="Total berita"
          nilai={angka(totalBerita)}
          catatan={`+${beritaMingguIni} minggu ini`}
          aksen={beritaMingguIni > 0}
        />
        <Kpi
          label="Pengumuman aktif"
          nilai={angka(pengumumanAktif)}
          catatan={`${disematkan} disematkan`}
        />
        <Kpi
          label="Total dibaca"
          nilai={angka(
            (await prisma.berita.aggregate({ _sum: { dibaca: true } }))._sum
              .dibaca ?? 0,
          )}
          catatan="Akumulasi seluruh artikel"
        />
        <Kpi
          label="Foto galeri"
          nilai={angka(totalFoto)}
          catatan={`${album.length} album`}
          akhir
        />
      </section>

      <section
        className="split"
        style={{ display: "grid", gridTemplateColumns: "7fr 5fr" }}
      >
        <div
          style={{
            padding: "32px 40px",
            borderRight: "2px solid var(--color-divider)",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 13,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
              }}
            >
              Berita terbaru
            </span>
            <Link href="/admin/berita" style={{ fontSize: 13.5 }}>
              Kelola semua →
            </Link>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {terbaru.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/admin/berita/${b.id}`}>{b.judul}</Link>
                    </td>
                    <td>{b.kategori.nama}</td>
                    <td>
                      <span
                        className={`tag ${b.status === "TERBIT" ? "tag-accent" : "tag-neutral"}`}
                      >
                        {b.status === "TERBIT" ? "Terbit" : "Draf"}
                      </span>
                    </td>
                    <td className="tnum">
                      {tanggalPendek(b.tanggalTerbit ?? b.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            Perlu tindakan
          </span>
          {perluTindakan.length === 0 && (
            <p className="text-muted" style={{ fontSize: 14 }}>
              Tidak ada yang perlu ditindaklanjuti.
            </p>
          )}
          {perluTindakan.map((t) => (
            <Link
              key={t.judul}
              href={t.href}
              style={{
                display: "block",
                border: "2px solid var(--color-divider)",
                padding: "16px 18px",
                marginBottom: 12,
                textDecoration: "none",
                color: "var(--color-text)",
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                {t.judul}
              </p>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--color-neutral-700)",
                  margin: "6px 0 0",
                }}
              >
                {t.sub}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
