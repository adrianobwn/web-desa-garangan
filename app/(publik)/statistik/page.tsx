import type { Metadata } from "next";
import { statistik, type Distribusi, type PerDusun } from "@/lib/queries";
import { KepalaHalaman, Kicker } from "@/components/publik/Kerangka";
import { angka, persen, tanggalPanjang } from "@/lib/util";

// Konten dikelola admin dan harus langsung tampil setelah disimpan.
// Render dinamis: query Postgres lokal murah untuk trafik satu desa,
// dan menghindari halaman basi akibat cache ISR.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistik Penduduk",
  description:
    "Data kependudukan Desa Garangan: jumlah penduduk, kepala keluarga, sebaran usia, pendidikan, mata pencaharian, dan penduduk per dusun.",
  alternates: { canonical: "/statistik" },
};

function Angka({ nilai, label }: { nilai: string; label: string }) {
  return (
    <div>
      <p
        className="tnum"
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: 48,
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

function Grup({
  judul,
  data,
  alt,
  catatan,
}: {
  judul: string;
  data: Distribusi[];
  alt?: boolean;
  catatan?: string;
}) {
  return (
    <div>
      <Kicker style={{ marginBottom: 24 }}>{judul}</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.map((d) => (
          <div key={d.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                marginBottom: 8,
                gap: 16,
              }}
            >
              <span>{d.label}</span>
              <strong className="tnum">
                {d.jumlah !== undefined ? `${angka(d.jumlah)} · ` : ""}
                {persen(d.nilai)}
              </strong>
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill${alt ? " alt" : ""}`}
                style={{ width: `${Math.min(100, d.nilai)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {catatan && (
        <p
          style={{
            fontSize: 13.5,
            lineHeight: "22px",
            color: "var(--color-neutral-700)",
            margin: "32px 0 0",
          }}
        >
          {catatan}
        </p>
      )}
    </div>
  );
}

export default async function HalamanStatistik() {
  const stat = await statistik();
  if (!stat) {
    return (
      <section className="section">
        <p className="text-muted">Data statistik belum diisi admin desa.</p>
      </section>
    );
  }

  const usia = (stat.kelompokUsia as Distribusi[]) ?? [];
  const pendidikan = (stat.pendidikan as Distribusi[]) ?? [];
  const kerja = (stat.mataPencaharian as Distribusi[]) ?? [];
  const dusun = (stat.perDusun as PerDusun[]) ?? [];

  // Jumlah warga bekerja: total dikurangi kelompok yang tidak/belum bekerja.
  // Persentase mata pencaharian dihitung dari angka ini, bukan dari seluruh
  // penduduk — kalau tidak, "pelajar & ibu rumah tangga" mendominasi grafik
  // dan menutupi gambaran mata pencaharian desa.
  const bekerja = stat.jumlahBekerja ?? 0;
  const persenBelumBekerja = stat.totalPenduduk
    ? Math.round(((stat.totalPenduduk - bekerja) / stat.totalPenduduk) * 1000) / 10
    : 0;
  const totalDusun = dusun.reduce(
    (a, d) => ({ jiwa: a.jiwa + d.jiwa, kk: a.kk + d.kk }),
    { jiwa: 0, kk: 0 },
  );

  return (
    <>
      <KepalaHalaman
        judul="Statistik Penduduk"
        deskripsi={`Data pendataan keluarga Desa Garangan, diperbarui ${tanggalPanjang(stat.terakhirDiperbarui)}.`}
        breadcrumb={[
          { href: "/", label: "Beranda" },
          { label: "Statistik Penduduk" },
        ]}
      />

      <section
        className="stat-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, auto)",
          justifyContent: "space-between",
          gap: 32,
          padding: "56px var(--pad)",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <Angka nilai={angka(stat.totalPenduduk)} label="Total penduduk" />
        <Angka nilai={angka(stat.lakiLaki)} label="Laki-laki" />
        <Angka nilai={angka(stat.perempuan)} label="Perempuan" />
        <Angka nilai={angka(stat.jumlahKk)} label="Kepala keluarga" />
      </section>

      <section
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "6fr 6fr",
          gap: 72,
          padding: "56px var(--pad)",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <Grup judul="Kelompok usia" data={usia} />
        <Grup judul="Pendidikan terakhir" data={pendidikan} alt />
      </section>

      <section
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "6fr 6fr",
          gap: 72,
          padding: "56px var(--pad)",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <Grup
          judul="Mata pencaharian"
          data={kerja}
          catatan={`Persentase dihitung dari ${angka(bekerja)} warga yang bekerja. Sisanya, ${persen(persenBelumBekerja)} dari seluruh penduduk, adalah pelajar, ibu rumah tangga, dan lansia yang tidak lagi bekerja.`}
        />
        <div>
          <Kicker style={{ marginBottom: 24 }}>Sumber data</Kicker>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: "24px",
              color: "var(--color-neutral-800)",
              margin: 0,
              maxWidth: "44ch",
            }}
          >
            Angka pada halaman ini berasal dari pendataan keluarga Desa
            Garangan yang mencakup {angka(stat.totalPenduduk)} jiwa dalam{" "}
            {angka(stat.jumlahKk)} kepala keluarga. Pemutakhiran dilakukan
            perangkat desa melalui panel administrasi.
          </p>
        </div>
      </section>

      {/* Tabel per wilayah hanya tampil bila datanya ada. Lebih baik bagian
          ini hilang daripada menampilkan angka yang tidak cocok dengan total. */}
      {dusun.length > 0 && (
        <section style={{ padding: "56px var(--pad) 72px" }}>
          <Kicker style={{ marginBottom: 24 }}>Penduduk per wilayah</Kicker>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Wilayah</th>
                  <th>KK</th>
                  <th>Jumlah jiwa</th>
                </tr>
              </thead>
              <tbody>
                {dusun.map((d) => (
                  <tr key={d.label}>
                    <td>
                      <strong>{d.label}</strong>
                    </td>
                    <td className="tnum">{angka(d.kk)}</td>
                    <td className="tnum">
                      <strong>{angka(d.jiwa)}</strong>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td className="tnum">
                    <strong>{angka(totalDusun.kk)}</strong>
                  </td>
                  <td className="tnum">
                    <strong>{angka(totalDusun.jiwa)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Sebagian kecil baris pendataan tidak mencantumkan RW, sehingga
              tidak bisa dikelompokkan ke dusun mana pun. Selisihnya
              disebutkan terbuka daripada dipaksa agar total terlihat pas. */}
          {totalDusun.jiwa !== stat.totalPenduduk && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--color-neutral-700)",
                margin: "16px 0 0",
              }}
            >
              {angka(stat.totalPenduduk - totalDusun.jiwa)} jiwa belum tercatat
              wilayahnya pada data pendataan, sehingga tidak termasuk dalam
              rincian di atas.
            </p>
          )}
        </section>
      )}

    </>
  );
}
