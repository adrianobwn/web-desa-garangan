import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KepalaHalaman, Kicker } from "@/components/publik/Kerangka";
import { BaganStruktur } from "@/components/publik/BaganStruktur";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Profil Desa",
  description:
    "Profil Desa Garangan, Kecamatan Wonosamodro, Kabupaten Boyolali: sejarah, visi misi, wilayah administratif, dan struktur organisasi pemerintah desa.",
  alternates: { canonical: "/profil" },
};

/**
 * Saklar naskah resmi. Selama masih `false`, halaman menampilkan penanda
 * bahwa teks sejarah dan visi-misi masih sementara.
 *
 * Setelah naskah resmi dari RPJMDes dimasukkan, ubah satu per satu menjadi
 * `true` dan penandanya hilang otomatis.
 */
const NASKAH_RESMI = {
  sejarah: true,
  visiMisi: true,
};

// Sumber: RPJMDes Perubahan 2020–2027, Perdes Garangan No. 2 Tahun 2025.
const VISI =
  "Terwujudnya Desa Garangan yang maju, sejahtera, sehat, damai, iman, dan aman; yang kreatif, inovatif, dan produktif, dilandasi akhlak mulia, menuju masyarakat sejahtera melalui peningkatan potensi pertanian dan optimalisasi pelayanan publik.";

const MISI = [
  "Meningkatkan ketaqwaan kepada Tuhan Yang Maha Esa.",
  "Meningkatkan kualitas sumber daya masyarakat.",
  "Memberikan pembinaan dan pengembangan kreativitas masyarakat di bidang keterampilan untuk menciptakan lapangan kerja.",
  "Meningkatkan kesehatan lingkungan masyarakat.",
  "Meningkatkan sarana dan prasarana dasar pemukiman.",
  "Melestarikan adat istiadat dan budaya asli desa.",
  "Meningkatkan produksi pertanian.",
];

// Isi null = belum ada data resmi. Baris bertanda itu otomatis diberi
// keterangan "belum dikonfirmasi"; setelah diisi, keterangannya hilang sendiri.
const GEOGRAFIS: [string, string | null][] = [
  ["Kode pos", "57382"],
  ["Luas wilayah", "880,756 ha"],
  ["Topografi", "Lahan tadah hujan"],
  ["Sungai", "Sungai Garangan & Sungai Serang"],
  ["Jarak ke kecamatan", "3 km"],
  ["Batas utara", "Desa Gunungsari"],
  ["Batas selatan", "Desa Bandung"],
  ["Batas timur", "Desa Bojong"],
  ["Batas barat", "Desa Jatilawang"],
];

// Urutan kepala desa sejak awal. Suharno dan Muhamad Prihatin masing-masing
// menjabat dua periode, karena itu namanya muncul dua kali di naskah asli.
const KEPALA_DESA = [
  "Proyo",
  "Sukandar",
  "Kosim",
  "Suparma",
  "Suharno",
  "Suharno",
  "Muhamad Prihatin",
  "Muhamad Prihatin",
  "Jamroji",
];

// Rincian penggunaan lahan, RPJMDes Perubahan 2020–2027 (total 880,756 ha).
const PENGGUNAAN_LAHAN: [string, number][] = [
  ["Hutan", 464.6],
  ["Tegalan", 278.356],
  ["Pekarangan", 96.08],
  ["Bengkok desa", 17.008],
  ["Kas desa", 9.672],
  ["Sawah tadah hujan", 9.593],
  ["Lain-lain", 5.325],
];

export default async function Profil() {
  const [wilayah, perangkat] = await Promise.all([
    prisma.wilayah.findMany({ orderBy: { urutan: "asc" } }),
    prisma.perangkatDesa.findMany({ orderBy: [{ tingkat: "asc" }, { urutan: "asc" }] }),
  ]);

  return (
    <>
      <KepalaHalaman
        judul="Profil Desa Garangan"
        deskripsi="Desa di Kecamatan Wonosamodro, Kabupaten Boyolali. Terdiri dari lima wilayah dusun dengan potensi utama pertanian lahan kering."
        breadcrumb={[{ href: "/", label: "Beranda" }, { label: "Profil Desa" }]}
      />

      {/* Sejarah + visi misi */}
      <section
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "6fr 6fr",
          gap: 72,
          padding: "56px var(--pad)",
        }}
      >
        <div>
          <Kicker style={{ marginBottom: 20 }}>Sejarah singkat</Kicker>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: "26px",
              color: "var(--color-neutral-800)",
              margin: 0,
            }}
          >
            Desa Garangan awalnya merupakan daerah kosong yang dihuni
            masyarakat yang mencari penghidupan baru. Sebagian kecil di
            antaranya pendatang dari arah utara, seperti daerah Panimbo,
            Kabupaten Grobogan, dan dari trah Gagatan.
          </p>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: "26px",
              color: "var(--color-neutral-800)",
              margin: "16px 0 0",
            }}
          >
            Nama Garangan berasal dari cerita bahwa wilayah ini dahulu menjadi
            tempat persembunyian hewan garangan putih, tepatnya di Kramat,
            sebelah selatan Dusun Garangan yang berbatasan dengan Desa Bandung.
            Punden tersebut masih banyak dikunjungi hingga kini dan dipercaya
            sebagai cikal bakal Desa Garangan.
          </p>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: "26px",
              color: "var(--color-neutral-800)",
              margin: "16px 0 0",
            }}
          >
            Desa Garangan terletak di Kecamatan Wonosamodro, Kabupaten Boyolali,
            Jawa Tengah, sekitar tiga kilometer arah utara dari ibu kota
            kecamatan. Sebagian besar wilayahnya berupa lahan kering tadah
            hujan, sehingga pola tanam warga mengikuti musim.
          </p>

          <Kicker style={{ margin: "32px 0 16px" }}>Kepala desa</Kicker>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              fontSize: 14.5,
              lineHeight: "23px",
            }}
          >
            {KEPALA_DESA.map((nama, i) => (
              <li
                key={`${nama}-${i}`}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "9px 0",
                  borderTop: "1px solid var(--color-neutral-300)",
                  borderBottom:
                    i === KEPALA_DESA.length - 1
                      ? "1px solid var(--color-neutral-300)"
                      : undefined,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    color: "var(--color-accent)",
                    minWidth: 34,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  {nama}
                  {i === KEPALA_DESA.length - 1 && (
                    <span style={{ color: "var(--color-neutral-700)" }}>
                      {" "}
                      — masih menjabat
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
          {!NASKAH_RESMI.sejarah && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--color-neutral-700)",
                margin: "20px 0 0",
              }}
            >
              * Sejarah ringkas sementara. Asal-usul desa masih menunggu
              keterangan dari sesepuh atau sekretaris desa.
            </p>
          )}
        </div>
        <div>
          <Kicker style={{ marginBottom: 20 }}>Visi &amp; Misi</Kicker>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 19,
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            “{VISI}”
          </p>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column" }}>
            {MISI.map((m, i) => (
              <div
                key={m}
                style={{
                  display: "flex",
                  gap: 16,
                  borderTop: "2px solid var(--color-divider)",
                  borderBottom:
                    i === MISI.length - 1
                      ? "2px solid var(--color-divider)"
                      : undefined,
                  padding: "14px 0",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    color: "var(--color-accent)",
                    minWidth: 28,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ fontSize: 15, lineHeight: "24px", margin: 0 }}>{m}</p>
              </div>
            ))}
          </div>
          {!NASKAH_RESMI.visiMisi && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--color-neutral-700)",
                margin: "20px 0 0",
              }}
            >
              * Rumusan sementara, menunggu dokumen RPJMDes resmi.
            </p>
          )}
        </div>
      </section>

      {/* Wilayah administratif */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
      <section style={{ padding: "56px var(--pad)" }}>
        <Kicker style={{ marginBottom: 24 }}>Wilayah administratif</Kicker>
        <div
          className="grid-2"
          style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 72 }}
        >
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>Kepala Dusun</th>
                  <th>RT / RW</th>
                  <th>Kelembagaan</th>
                </tr>
              </thead>
              <tbody>
                {wilayah.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.nama}</strong>
                    </td>
                    {/* Kadus yang belum ada dibiarkan kosong, bukan diberi
                        label — keterangan resminya belum turun. */}
                    <td>{w.namaKadus ?? ""}</td>
                    <td>
                      {w.jumlahRt
                        ? `${w.jumlahRt} RT${w.jumlahRw ? ` · RW ${w.jumlahRw}` : ""}`
                        : "—"}
                    </td>
                    <td>{w.kelembagaan ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ border: "2px solid var(--color-divider)", padding: 28 }}>
            <Kicker style={{ marginBottom: 16 }}>Geografis</Kicker>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 14.5,
                lineHeight: "23px",
              }}
            >
              {GEOGRAFIS.map(([k, v], i) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "10px 0",
                    borderTop: "1px solid var(--color-neutral-300)",
                    borderBottom:
                      i === GEOGRAFIS.length - 1
                        ? "1px solid var(--color-neutral-300)"
                        : undefined,
                  }}
                >
                  <span style={{ color: "var(--color-neutral-700)" }}>{k}</span>
                  <strong style={{ color: v ? undefined : "var(--color-neutral-500)" }}>
                    {v ?? "Belum dikonfirmasi"}
                  </strong>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Penggunaan lahan dipisah ke barisnya sendiri: daftarnya tujuh
              baris, terlalu tinggi bila ditumpuk di kolom samping. */}
          <div
            style={{
              border: "2px solid var(--color-divider)",
              padding: "28px 28px 24px",
              marginTop: 40,
            }}
          >
            <Kicker style={{ marginBottom: 20 }}>Penggunaan lahan</Kicker>
            <div className="lahan-grid">
              {PENGGUNAAN_LAHAN.map(([nama, ha]) => (
                <div
                  key={nama}
                  style={{
                    borderTop: "2px solid var(--color-divider)",
                    paddingTop: 12,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "var(--color-neutral-700)",
                      marginBottom: 4,
                    }}
                  >
                    {nama}
                  </span>
                  <strong
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: 19,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {ha.toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: "var(--color-neutral-700)",
                      }}
                    >
                      {" "}
                      ha
                    </span>
                  </strong>
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--color-neutral-700)",
                margin: "24px 0 0",
              }}
            >
              Sumber: RPJMDes Perubahan 2020–2027 (Perdes No. 2 Tahun 2025).
              Total 880,756 ha.
            </p>
          </div>
        </section>


      {/* Struktur organisasi */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
      <BaganStruktur perangkat={perangkat} />

      <section style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>
        <div style={{ padding: "64px var(--pad)" }}>
          <h2
            className="hero-title"
            style={{
              fontSize: 44,
              lineHeight: 1.08,
              letterSpacing: "-0.015em",
              margin: "0 0 0 -0.058em",
              color: "var(--color-bg)",
            }}
          >
            Ingin melihat data lengkap kependudukan?
          </h2>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Link
              href="/statistik"
              className="btn btn-ghost"
              style={{ color: "var(--color-bg)", borderColor: "var(--color-bg)" }}
            >
              Buka halaman statistik
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
