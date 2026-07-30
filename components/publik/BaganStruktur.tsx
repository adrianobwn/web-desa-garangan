import { Kicker } from "@/components/publik/Kerangka";

type Perangkat = {
  id: string;
  nama: string;
  jabatan: string;
  tingkat: number;
};

/**
 * Bagan struktur organisasi desa.
 *
 * Garis penghubung digambar dengan pseudo-element CSS (::before/::after) di
 * globals.css, bukan SVG — pohon organisasi desa selalu sederhana (satu induk
 * per tingkat), jadi tidak perlu penempatan koordinat.
 */
function Kotak({
  jabatan,
  nama,
  ragam = "biasa",
}: {
  jabatan: string;
  nama: string;
  ragam?: "utama" | "kedua" | "biasa";
}) {
  const utama = ragam === "utama";
  const kedua = ragam === "kedua";
  const belumAda = nama.startsWith("—");

  return (
    <div
      className="org-kotak"
      style={{
        border: `2px solid ${utama ? "var(--color-accent)" : "var(--color-divider)"}`,
        background: utama
          ? "var(--color-accent)"
          : kedua
            ? "var(--color-accent-100)"
            : "var(--color-bg)",
        color: utama ? "var(--color-bg)" : undefined,
        padding: utama ? "18px 28px" : "14px 18px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: 10.5,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          opacity: utama ? 0.85 : 1,
          color: utama ? undefined : "var(--color-neutral-700)",
        }}
      >
        {jabatan}
      </span>
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: utama ? 20 : kedua ? 17 : 15,
          lineHeight: 1.2,
          margin: "6px 0 0",
          color: belumAda ? "var(--color-neutral-500)" : undefined,
        }}
      >
        {belumAda ? "Belum dikonfirmasi" : nama}
      </p>
    </div>
  );
}

export function BaganStruktur({ perangkat }: { perangkat: Perangkat[] }) {
  const kades = perangkat.find((p) => p.tingkat === 0);
  const sekdes = perangkat.find((p) => p.tingkat === 1);
  const kasi = perangkat.filter((p) => p.tingkat === 2);
  const kadus = perangkat.filter((p) => p.tingkat === 3);
  const staf = perangkat.filter((p) => p.tingkat === 4);
  // Kalimat penutup soal "belum dikonfirmasi" hanya relevan selama masih
  // ada nama yang kosong.
  const adaKosong = perangkat.some((p) => p.nama.startsWith("—"));

  return (
    <section style={{ padding: "56px var(--pad) 72px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 24,
          marginBottom: 40,
          flexWrap: "wrap",
        }}
      >
        <Kicker>Struktur organisasi &amp; tata kerja</Kicker>
        <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
          Perdes Garangan Tahun 2017
        </span>
      </div>

      <div className="org">
        {kades && (
          <div className="org-tingkat">
            <Kotak jabatan="Kepala Desa" nama={kades.nama} ragam="utama" />
          </div>
        )}

        {sekdes && (
          <>
            <div className="org-garis" aria-hidden="true" />
            <div className="org-tingkat">
              <Kotak
                jabatan="Sekretaris Desa"
                nama={sekdes.nama}
                ragam="kedua"
              />
            </div>
          </>
        )}

        {kasi.length > 0 && (
          <>
            <div className="org-garis" aria-hidden="true" />
            <p className="org-label">Kepala Seksi &amp; Kepala Urusan</p>
            <div className="org-baris">
              {kasi.map((p) => (
                <Kotak key={p.id} jabatan={p.jabatan} nama={p.nama} />
              ))}
            </div>
          </>
        )}

        {kadus.length > 0 && (
          <>
            <div className="org-garis" aria-hidden="true" />
            <p className="org-label">Kepala Dusun</p>
            <div className="org-baris org-baris-5">
              {kadus.map((p) => (
                <Kotak key={p.id} jabatan={p.jabatan} nama={p.nama} />
              ))}
            </div>
          </>
        )}

      </div>

      {/* Staf berada di bawah Sekretaris Desa, bukan di bawah Kepala Dusun —
          maka dipisah dari rantai bagan agar garisnya tidak menyesatkan. */}
      {staf.length > 0 && (
        <div
          style={{
            borderTop: "2px solid var(--color-divider)",
            marginTop: 48,
            paddingTop: 28,
          }}
        >
          <p
            className="org-label"
            style={{ margin: "0 0 16px", textAlign: "left" }}
          >
            Staf sekretariat
          </p>
          <div className="org-staf">
            {staf.map((s) => (
              <div key={s.id} className="org-staf-item">
                <span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: 15,
                      lineHeight: 1.25,
                    }}
                  >
                    {s.nama}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--color-neutral-700)",
                      marginTop: 2,
                    }}
                  >
                    {s.jabatan}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: 13,
          lineHeight: "22px",
          color: "var(--color-neutral-700)",
          margin: "32px 0 0",
          maxWidth: "62ch",
        }}
      >
        Bagan disusun dari data perangkat desa yang dikelola lewat panel admin —
        setiap perubahan pejabat langsung tercermin di halaman ini.
        {adaKosong &&
          " Nama bertanda \u201cbelum dikonfirmasi\u201d menunggu keterangan resmi dari sekretaris desa."}
      </p>
    </section>
  );
}
