import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KepalaHalaman, Kicker } from "@/components/publik/Kerangka";
import { Foto } from "@/components/Foto";
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
 * bahwa teks sambutan, sejarah, dan visi-misi masih contoh.
 *
 * Setelah naskah resmi dari kepala desa & RPJMDes dimasukkan, ubah satu
 * per satu menjadi `true` — penandanya hilang otomatis.
 */
const NASKAH_RESMI = {
  sambutan: false,
  sejarah: false,
  visiMisi: false,
};

const MISI = [
  "Meningkatkan pelayanan administrasi yang cepat, mudah, dan tanpa pungutan.",
  "Mengembangkan potensi pertanian jagung, singkong, pisang, dan kacang tanah.",
  "Memperkuat infrastruktur dasar: jalan usaha tani, air bersih, dan irigasi.",
  "Menghidupkan kegiatan kepemudaan dan keagamaan di tiap dusun.",
];

// Isi null = belum ada data resmi. Baris bertanda itu otomatis diberi
// keterangan "belum dikonfirmasi"; setelah diisi, keterangannya hilang sendiri.
const GEOGRAFIS: [string, string | null][] = [
  ["Kode pos", "57382"],
  ["Topografi", "Lahan tadah hujan"],
  ["Sungai", "Sungai Garangan"],
  ["Batas utara", null],
  ["Batas selatan", null],
  ["Batas timur/barat", null],
];

export default async function Profil() {
  const [wilayah, perangkat] = await Promise.all([
    prisma.wilayah.findMany({ orderBy: { urutan: "asc" } }),
    prisma.perangkatDesa.findMany({ orderBy: [{ tingkat: "asc" }, { urutan: "asc" }] }),
  ]);

  const kades = perangkat.find((p) => p.tingkat === 0);

  return (
    <>
      <KepalaHalaman
        judul="Profil Desa Garangan"
        deskripsi="Desa di Kecamatan Wonosamodro, Kabupaten Boyolali — sekaligus ibu kota kecamatan hasil pemekaran Wonosegoro tahun 2019. Terdiri dari lima dusun dengan potensi utama pertanian lahan kering."
        breadcrumb={[{ href: "/", label: "Beranda" }, { label: "Profil Desa" }]}
      />

      {/* Sambutan kepala desa */}
      <section
        className="split"
        style={{
          display: "grid",
          gridTemplateColumns: "4fr 8fr",
          gap: 72,
          padding: "56px var(--pad)",
        }}
      >
        <div>
          <figure style={{ margin: 0 }}>
            <Foto
              src={kades?.foto}
              alt={`Foto Kepala Desa ${kades?.nama ?? ""}`}
              tinggi={340}
              sizes="(max-width: 1024px) 100vw, 30vw"
            />
          </figure>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 20,
              margin: "16px 0 4px",
            }}
          >
            {kades?.nama}
          </p>
          <p
            style={{
              fontSize: 13,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--color-neutral-700)",
              margin: 0,
            }}
          >
            Kepala Desa Garangan
          </p>
        </div>
        <div>
          <Kicker style={{ marginBottom: 20 }}>Sambutan Kepala Desa</Kicker>
          <blockquote
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 28,
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              maxWidth: "34ch",
              margin: 0,
            }}
          >
            “Website ini kami hadirkan agar setiap warga — di desa maupun di
            perantauan — dapat mengikuti kabar dan pembangunan Garangan secara
            terbuka.”
          </blockquote>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: "26px",
              color: "var(--color-neutral-800)",
              maxWidth: "58ch",
              margin: "28px 0 0",
            }}
          >
            Assalamu&apos;alaikum warahmatullahi wabarakatuh. Atas nama
            pemerintah desa, saya menyampaikan terima kasih atas kunjungan Anda
            di portal resmi Desa Garangan. Melalui media ini kami berkomitmen
            menyajikan informasi pemerintahan, pembangunan, dan kemasyarakatan
            secara transparan. Masukan warga sangat kami harapkan demi Garangan
            yang lebih maju.
          </p>
          {!NASKAH_RESMI.sambutan && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--color-neutral-700)",
                margin: "20px 0 0",
              }}
            >
              * Teks sambutan contoh — menunggu naskah resmi dari kepala desa.
            </p>
          )}
        </div>
      </section>

      {/* Sejarah + visi misi */}
      <div className="pad">
        <hr className="hr" style={{ margin: 0 }} />
      </div>
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
            Desa Garangan tumbuh di tepi aliran Sungai Garangan yang membelah
            wilayah desa dan menjadi sumber kehidupan warga sejak masa kolonial.
            Nama desa dipercaya berasal dari nama sungai tersebut. Wilayahnya
            merupakan lahan tadah hujan, sehingga pola tanam warga mengikuti
            musim — jagung dan kacang tanah di musim hujan, singkong sebagai
            andalan sepanjang tahun.
          </p>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: "26px",
              color: "var(--color-neutral-800)",
              margin: "16px 0 0",
            }}
          >
            Tahun 2019, melalui Perda Kabupaten Boyolali No. 18 Tahun 2018,
            Kecamatan Wonosamodro dibentuk sebagai pemekaran Kecamatan
            Wonosegoro — dan Desa Garangan ditetapkan sebagai ibu kota kecamatan
            baru tersebut.
          </p>
          {!NASKAH_RESMI.sejarah && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--color-neutral-700)",
                margin: "20px 0 0",
              }}
            >
              * Narasi contoh — verifikasi asal-usul nama ke sesepuh/sekretaris
              desa.
            </p>
          )}
        </div>
        <div>
          <Kicker style={{ marginBottom: 20 }}>Visi &amp; Misi</Kicker>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 24,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            “Terwujudnya Desa Garangan yang maju, mandiri, dan sejahtera
            berlandaskan gotong royong.”
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
              * Visi-misi contoh — menunggu dokumen RPJMDes resmi.
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
          <div>
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
