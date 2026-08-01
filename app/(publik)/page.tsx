import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  agendaMendatang,
  daftarBerita,
  pengumumanTerbaru,
  statistik,
  type Distribusi,
} from "@/lib/queries";
import { Kicker } from "@/components/publik/Kerangka";
import { KartuBerita } from "@/components/publik/KartuBerita";
import { FormKontak } from "@/components/publik/FormKontak";
import { PetaLokasi } from "@/components/publik/PetaLokasi";
import { Foto } from "@/components/Foto";
import { angka, BULAN_SINGKAT, persen, tanggalPendek } from "@/lib/util";

// Konten dikelola admin dan harus langsung tampil setelah disimpan.
// Render dinamis: query Postgres lokal murah untuk trafik satu desa,
// dan menghindari halaman basi akibat cache ISR.
export const dynamic = "force-dynamic";

/**
 * Kontak resmi desa. Isi `null` berarti belum dikonfirmasi ke sekretaris desa
 * — halaman menampilkan "Belum tersedia", bukan nomor samaran yang bisa
 * disangka data asli.
 *
 * Puskesmas Wonosamodro diambil dari laman resmi
 * puskesmaswonosamodro.boyolali.go.id.
 */
const KONTAK = {
  telepon: null as string | null,
  surel: null as string | null,
  linmas: null as string | null,
  puskesmas: "0812-2890-585",
};

const POTENSI = [
  {
    nama: "Jagung",
    tag: "Pertanian",
    teks: "Komoditas utama desa — panen dua kali setahun, diserap penggilingan pakan lokal.",
  },
  {
    nama: "Singkong",
    tag: "Pertanian",
    teks: "Andalan lahan tadah hujan, bahan baku olahan pangan rumah tangga.",
  },
  {
    nama: "Pisang",
    tag: "Perkebunan",
    teks: "Ditanam di pekarangan hampir setiap rumah, dijual ke pasar kecamatan.",
  },
  {
    nama: "Kacang tanah",
    tag: "Pertanian",
    teks: "Tanaman sela musim kemarau, hasil dijual dalam bentuk polong kering.",
  },
];

function Angka({ nilai, label }: { nilai: string; label: string }) {
  return (
    <div>
      <p
        className="tnum"
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: 44,
          lineHeight: 1,
          color: "var(--color-accent)",
          margin: 0,
        }}
      >
        {nilai}
      </p>
      <p
        style={{
          fontSize: 13,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--color-neutral-700)",
          margin: "14px 0 0",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function Bar({
  label,
  nilai,
  satuan = "%",
  alt,
}: {
  label: string;
  nilai: number;
  satuan?: string;
  alt?: boolean;
}) {
  return (
    <div style={{ borderTop: "2px solid var(--color-divider)", padding: "16px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        <span>{label}</span>
        <strong className="tnum">
          {satuan === "%" ? persen(nilai) : angka(nilai)}
        </strong>
      </div>
      <div className="bar-track" style={{ height: 10 }}>
        <div
          className={`bar-fill${alt ? " alt" : ""}`}
          style={{ width: `${Math.min(100, nilai)}%` }}
        />
      </div>
    </div>
  );
}

export default async function Beranda() {
  const [stat, berita, pengumuman, agenda, galeri, jumlahBerita] =
    await Promise.all([
      statistik(),
      daftarBerita({ page: 1, perPage: 3, publik: true }),
      pengumumanTerbaru(4),
      agendaMendatang(3),
      prisma.galeri.findMany({ orderBy: { tanggalUnggah: "desc" }, take: 5 }),
      prisma.berita.count({
        where: { status: "TERBIT", tanggalTerbit: { lte: new Date() } },
      }),
    ]);

  const disematkan = pengumuman.find((p) => p.disematkan);
  const lainnya = pengumuman.filter((p) => !p.disematkan).slice(0, 3);
  const kerja = (stat?.mataPencaharian as Distribusi[]) ?? [];
  const didik = (stat?.pendidikan as Distribusi[]) ?? [];
  const usia = (stat?.kelompokUsia as Distribusi[]) ?? [];
  const agendaTerdekat = agenda[0];

  return (
    <>
      {/* Hero */}
      <section id="beranda" style={{ padding: "96px var(--pad) 64px" }}>
        <Kicker style={{ marginBottom: 20 }}>
          Pemerintah Desa Garangan · Kec. Wonosamodro · Kab. Boyolali
        </Kicker>
        <h1
          className="hero-title"
          style={{
            fontSize: 80,
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            margin: "0 0 0 -0.058em",
          }}
        >
          <span style={{ display: "block" }}>Satu desa, satu pintu</span>
          <span style={{ display: "block" }}>informasi.</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: "28px",
            maxWidth: "58ch",
            margin: "36px 0 0",
            color: "var(--color-neutral-800)",
          }}
        >
          Portal resmi Desa Garangan: berita desa, pengumuman, data
          kependudukan.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <Link href="/berita" className="btn btn-primary">
            Baca berita terbaru
          </Link>
          <Link href="/profil" className="btn btn-ghost">
            Lihat profil desa
          </Link>
        </div>
      </section>

      <figure style={{ margin: "0 var(--pad)" }}>
        <Foto
          src="/foto/balai-desa-3.jpg"
          alt="Balai Desa Garangan dilihat dari lapangan"
          tinggi={420}
          priority
          sizes="100vw"
        />
      </figure>

      <div className="pad">
        <hr className="hr" style={{ margin: "64px 0 0" }} />
      </div>
      <section
        className="stat-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, auto)",
          justifyContent: "space-between",
          gap: 32,
          padding: "56px var(--pad)",
        }}
      >
        <Angka nilai={angka(stat?.totalPenduduk ?? 0)} label="Jiwa penduduk" />
        <Angka nilai={angka(stat?.jumlahKk ?? 0)} label="Kepala keluarga" />
        <Angka nilai="5" label="Dusun" />
        <Angka nilai={`${stat?.luasWilayahHa ?? 0} ha`} label="Luas wilayah" />
      </section>

      {/* Ubin akses cepat */}
      <div
        className="quick-tiles"
        style={{
          borderTop: "2px solid var(--color-divider)",
          borderBottom: "2px solid var(--color-divider)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {[
          {
            href: "/berita",
            judul: "Berita desa",
            sub: `${jumlahBerita} artikel`,
          },
          {
            href: "/agenda",
            judul: "Pengumuman",
            sub: `${pengumuman.filter((p) => p.disematkan).length} disematkan`,
          },
          {
            href: "/agenda",
            judul: "Agenda kegiatan",
            sub: agendaTerdekat
              ? `${agendaTerdekat.judul.split(" ").slice(0, 3).join(" ")} · ${new Date(agendaTerdekat.tanggal).getDate()} ${BULAN_SINGKAT[new Date(agendaTerdekat.tanggal).getMonth()]}`
              : "Belum ada agenda",
          },
          {
            href: "/statistik",
            judul: "Statistik penduduk",
            sub: `Pembaruan ${tanggalPendek(stat?.terakhirDiperbarui)}`,
          },
        ].map((t, i, arr) => (
          <Link
            key={t.judul}
            href={t.href}
            style={{
              padding: "28px 32px",
              paddingLeft: i === 0 ? "var(--pad)" : 32,
              paddingRight: i === arr.length - 1 ? "var(--pad)" : 32,
              borderRight:
                i === arr.length - 1
                  ? undefined
                  : "2px solid var(--color-divider)",
              textDecoration: "none",
              color: "var(--color-text)",
            }}
          >
            <span
              style={{
                display: "block",
                width: 10,
                height: 10,
                background: "var(--color-accent)",
                marginBottom: 16,
              }}
            />
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              {t.judul}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 13,
                color: "var(--color-neutral-700)",
                marginTop: 6,
              }}
            >
              {t.sub}
            </span>
          </Link>
        ))}
      </div>

      {/* Berita terbaru */}
      <section id="berita" style={{ padding: "56px var(--pad) 72px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 24,
            gap: 24,
          }}
        >
          <Kicker>Berita terbaru</Kicker>
          <Link href="/berita" style={{ fontSize: 14 }}>
            Semua berita →
          </Link>
        </div>
        {berita.items.length === 0 ? (
          <p className="text-muted">Belum ada berita yang diterbitkan.</p>
        ) : (
          <div
            className="grid-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
          >
            {berita.items.map((b) => (
              <KartuBerita key={b.id} berita={b} />
            ))}
          </div>
        )}
      </section>

      {/* Pengumuman + agenda */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
      <section
        id="pengumuman"
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "6fr 6fr",
          gap: 72,
          padding: "56px var(--pad) 72px",
        }}
      >
        <div>
          <Kicker style={{ marginBottom: 20 }}>Pengumuman</Kicker>
          {disematkan && (
            <div
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                padding: 28,
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
                Disematkan
              </span>
              <h3
                style={{
                  fontSize: 24,
                  lineHeight: 1.2,
                  margin: "12px 0 0",
                  color: "var(--color-bg)",
                }}
              >
                {disematkan.judul}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: "22px",
                  margin: "12px 0 0",
                  opacity: 0.9,
                }}
              >
                {disematkan.isi}
              </p>
            </div>
          )}
          {lainnya.map((p) => (
            <div
              key={p.id}
              style={{
                borderBottom: "2px solid var(--color-divider)",
                padding: "18px 0",
                display: "flex",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                {p.judul}
              </p>
              <span
                className="tnum"
                style={{
                  fontSize: 13,
                  color: "var(--color-neutral-700)",
                  whiteSpace: "nowrap",
                }}
              >
                {new Date(p.tanggal).getDate()}{" "}
                {BULAN_SINGKAT[new Date(p.tanggal).getMonth()]}
              </span>
            </div>
          ))}
        </div>

        <div id="agenda">
          <Kicker style={{ marginBottom: 20 }}>Agenda terdekat</Kicker>
          {agenda.map((a, i) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                gap: 20,
                borderTop: "2px solid var(--color-divider)",
                borderBottom:
                  i === agenda.length - 1
                    ? "2px solid var(--color-divider)"
                    : undefined,
                padding: "18px 0",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: 28,
                  minWidth: 60,
                  lineHeight: 1,
                }}
              >
                {String(new Date(a.tanggal).getDate()).padStart(2, "0")}
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: "var(--color-neutral-700)",
                    marginTop: 4,
                  }}
                >
                  {BULAN_SINGKAT[new Date(a.tanggal).getMonth()]}
                </span>
              </span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                  {a.judul}
                </p>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--color-neutral-700)",
                    margin: "6px 0 0",
                  }}
                >
                  {[a.waktu, a.lokasi].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
          <p
            style={{
              fontSize: 13.5,
              lineHeight: "22px",
              color: "var(--color-neutral-700)",
              margin: "16px 0 0",
            }}
          >
            <strong style={{ color: "var(--color-text)" }}>
              Kegiatan rutin:
            </strong>{" "}
            Yasinan tiap malam Jumat · Posyandu balita tiap bulan · Kerja bakti
            Karang Taruna
          </p>
          <Link
            href="/agenda"
            style={{ display: "inline-block", fontSize: 14, marginTop: 12 }}
          >
            Kalender lengkap →
          </Link>
        </div>
      </section>

      {/* Potensi unggulan */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
      <section id="potensi" style={{ padding: "56px var(--pad) 72px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <Kicker>Potensi unggulan desa</Kicker>
        </div>
        <div
          className="grid-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 28,
          }}
        >
          {POTENSI.map((p) => (
            <article className="card" key={p.nama}>
              <figure style={{ margin: "0 0 16px" }}>
                <Foto
                  src={null}
                  alt={`Foto ${p.nama.toLowerCase()}`}
                  tinggi={140}
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              </figure>
              <span className="tag tag-accent">{p.tag}</span>
              <h3 className="card-title" style={{ marginTop: 12 }}>
                {p.nama}
              </h3>
              <p className="card-body" style={{ marginTop: 8 }}>
                {p.teks}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Statistik ringkas */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
      <section
        id="statistik"
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          gap: 72,
          padding: "56px var(--pad) 72px",
        }}
      >
        <div>
          <Kicker style={{ marginBottom: 20 }}>Statistik penduduk</Kicker>
          <h2
            style={{
              fontSize: 34,
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              margin: "0 0 0 -0.045em",
            }}
          >
            Data desa, terbuka dan terbarui.
          </h2>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: "26px",
              color: "var(--color-neutral-800)",
              maxWidth: "44ch",
              margin: "20px 0 0",
            }}
          >
            Ringkasan kependudukan per {tanggalPendek(stat?.terakhirDiperbarui)}{" "}
            dari registrasi desa. Rincian pendidikan, pekerjaan, dan usia
            tersedia di halaman statistik.
          </p>
          <Link
            href="/statistik"
            style={{ display: "inline-block", fontSize: 14, marginTop: 16 }}
          >
            Buka halaman statistik →
          </Link>
        </div>
        <div
          className="grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 48px",
          }}
        >
          <Bar
            label="Laki-laki"
            nilai={stat?.lakiLaki ?? 0}
            satuan="jiwa"
          />
          <Bar
            label="Perempuan"
            nilai={stat?.perempuan ?? 0}
            satuan="jiwa"
            alt
          />
          {kerja[0] && <Bar label={kerja[0].label} nilai={kerja[0].nilai} />}
          {kerja[1] && <Bar label={kerja[1].label} nilai={kerja[1].nilai} alt />}
          {usia[1] && (
            <Bar label={`Usia ${usia[1].label}`} nilai={usia[1].nilai} />
          )}
          {didik[3] && <Bar label={didik[3].label} nilai={didik[3].nilai} alt />}
        </div>
      </section>

      {/* Galeri */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
      <section id="galeri" style={{ padding: "56px var(--pad) 72px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <Kicker>Galeri desa</Kicker>
          <Link href="/galeri" style={{ fontSize: 14 }}>
            Semua album →
          </Link>
        </div>
        <div
          className="grid-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 12,
          }}
        >
          {galeri.map((g, i) => (
            <figure
              key={g.id}
              style={{ margin: 0, gridColumn: `span ${i < 3 ? 2 : 3}` }}
            >
              <Foto
                src={g.urlFoto || null}
                alt={g.keterangan}
                tinggi={200}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </figure>
          ))}
        </div>
      </section>

      {/* Lokasi & kontak */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
      <section
        id="kontak"
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "6fr 6fr",
          gap: 72,
          padding: "56px var(--pad) 72px",
        }}
      >
        <div>
          <Kicker style={{ marginBottom: 20 }}>Lokasi &amp; kontak</Kicker>
          <PetaLokasi />
          <div
            className="grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px 32px",
              marginTop: 24,
              fontSize: 14.5,
              lineHeight: "23px",
            }}
          >
            <div>
              <strong>Alamat</strong>
              <br />
              Dusun Garangan, Desa Garangan, Kec. Wonosamodro, Kab. Boyolali
              57382
            </div>
            <div>
              <strong>Telepon / WA</strong>
              <br />
              {KONTAK.telepon ?? (
                <span style={{ color: "var(--color-neutral-500)" }}>
                  Belum tersedia
                </span>
              )}
            </div>
            <div>
              <strong>Surel</strong>
              <br />
              {KONTAK.surel ? (
                <a href={`mailto:${KONTAK.surel}`}>{KONTAK.surel}</a>
              ) : (
                <span style={{ color: "var(--color-neutral-500)" }}>
                  Belum tersedia
                </span>
              )}
            </div>
            <div>
              <strong>Darurat</strong>
              <br />
              Puskesmas Wonosamodro{" "}
              <a href={`tel:${KONTAK.puskesmas.replace(/\D/g, "")}`}>
                {KONTAK.puskesmas}
              </a>
              {KONTAK.linmas && <> · Linmas {KONTAK.linmas}</>}
            </div>
          </div>
        </div>
        <div>
          <Kicker style={{ marginBottom: 20 }}>Kirim pesan / aduan</Kicker>
          <FormKontak />
        </div>
      </section>

      {/* Banner penutup */}
      <section style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>
        <div style={{ padding: "72px var(--pad)" }}>
          <h2
            className="hero-title"
            style={{
              fontSize: 52,
              lineHeight: 1.06,
              letterSpacing: "-0.015em",
              margin: "0 0 0 -0.058em",
              color: "var(--color-bg)",
            }}
          >
            <span style={{ display: "block" }}>Ada pertanyaan atau aduan?</span>
            <span style={{ display: "block" }}>
              Sampaikan ke perangkat desa.
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: "26px",
              maxWidth: "52ch",
              margin: "24px 0 0",
              opacity: 0.9,
            }}
          >
            Kantor Desa Garangan buka setiap hari kerja pukul 08.00–15.00. Warga
            juga dapat mengirim pesan lewat formulir di atas.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
            <Link
              href="/#kontak"
              className="btn btn-ghost"
              style={{
                color: "var(--color-bg)",
                borderColor: "var(--color-bg)",
              }}
            >
              Kirim pesan
            </Link>
            <Link
              href="/profil"
              className="btn btn-ghost"
              style={{
                color: "var(--color-bg)",
                borderColor: "var(--color-bg)",
              }}
            >
              Profil desa
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
