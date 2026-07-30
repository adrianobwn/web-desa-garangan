import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { KepalaHalaman, Kicker } from "@/components/publik/Kerangka";
import { BULAN_SINGKAT, tanggalPanjang } from "@/lib/util";

// Konten dikelola admin dan harus langsung tampil setelah disimpan.
// Render dinamis: query Postgres lokal murah untuk trafik satu desa,
// dan menghindari halaman basi akibat cache ISR.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda & Pengumuman",
  description:
    "Jadwal kegiatan Desa Garangan dan pengumuman resmi dari pemerintah desa.",
  alternates: { canonical: "/agenda" },
};

export default async function HalamanAgenda() {
  const [mendatang, pengumuman] = await Promise.all([
    prisma.agenda.findMany({
      where: { tanggal: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      orderBy: { tanggal: "asc" },
      take: 8,
    }),
    prisma.pengumuman.findMany({
      orderBy: [{ disematkan: "desc" }, { tanggal: "desc" }],
      take: 6,
    }),
  ]);

  const disematkan = pengumuman.find((p) => p.disematkan);
  const biasa = pengumuman.filter((p) => !p.disematkan);

  return (
    <>
      <KepalaHalaman
        judul="Agenda & Pengumuman"
        deskripsi="Jadwal kegiatan desa dan pemberitahuan resmi dari pemerintah desa — pengganti pengeras suara masjid untuk warga di perantauan."
        breadcrumb={[
          { href: "/", label: "Beranda" },
          { label: "Agenda & Pengumuman" },
        ]}
      />

      <div
        className="split"
        style={{ display: "grid", gridTemplateColumns: "7fr 5fr" }}
      >
        <div
          style={{
            padding: "48px 48px 72px var(--pad)",
            borderRight: "2px solid var(--color-divider)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Kicker>Agenda mendatang</Kicker>
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: "23px",
              color: "var(--color-neutral-700)",
              margin: "0 0 24px",
              maxWidth: "60ch",
            }}
          >
            Kegiatan tingkat desa dicantumkan di sini. Acara yang dijalankan
            masing-masing dusun diumumkan langsung oleh kepala dusun setempat.
          </p>

          {mendatang.length === 0 && (
            <p className="text-muted">Belum ada agenda mendatang.</p>
          )}
          {mendatang.map((a, i) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                gap: 20,
                borderTop: "2px solid var(--color-divider)",
                borderBottom:
                  i === mendatang.length - 1
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
                  {[a.waktu, a.lokasi, a.deskripsi].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}

        </div>

        <aside style={{ padding: "48px var(--pad) 72px 48px" }}>
          <Kicker style={{ marginBottom: 16 }}>Pengumuman</Kicker>
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
                Disematkan · {tanggalPanjang(disematkan.tanggal)}
              </span>
              <h3
                style={{
                  fontSize: 22,
                  lineHeight: 1.25,
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
          {biasa.map((p) => (
            <div
              key={p.id}
              style={{
                borderBottom: "2px solid var(--color-divider)",
                padding: "18px 0",
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{p.judul}</p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-neutral-700)",
                  margin: "6px 0 0",
                }}
              >
                {tanggalPanjang(p.tanggal)}
                {p.kategori ? ` · ${p.kategori}` : ""}
              </p>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
