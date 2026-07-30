"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Distribusi = { label: string; nilai: number };
type PerDusun = { label: string; jiwa: number; kk: number };

export type NilaiStatistik = {
  totalPenduduk: number;
  jumlahKk: number;
  lakiLaki: number;
  perempuan: number;
  luasWilayahHa: number;
  jumlahBekerja: number;
  perDusun: PerDusun[];
  mataPencaharian: Distribusi[];
  pendidikan: Distribusi[];
  kelompokUsia: Distribusi[];
};

function BarisDistribusi({
  data,
  onUbah,
  onHapus,
}: {
  data: Distribusi[];
  onUbah: (i: number, d: Distribusi) => void;
  onHapus: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={d.label}
            aria-label="Label"
            onChange={(e) => onUbah(i, { ...d, label: e.target.value })}
          />
          <input
            className="input"
            type="number"
            step="0.1"
            min="0"
            max="100"
            style={{ width: 90 }}
            value={d.nilai}
            aria-label={`Persentase ${d.label}`}
            onChange={(e) => onUbah(i, { ...d, nilai: Number(e.target.value) })}
          />
          <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>%</span>
          <button
            type="button"
            className="btn btn-ghost"
            aria-label={`Hapus ${d.label}`}
            onClick={() => onHapus(i)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function Grup({
  judul,
  data,
  set,
}: {
  judul: string;
  data: Distribusi[];
  set: (d: Distribusi[]) => void;
}) {
  const total = data.reduce((a, d) => a + d.nilai, 0);
  return (
    <div>
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
        {judul}
      </span>
      <BarisDistribusi
        data={data}
        onUbah={(i, d) => set(data.map((x, j) => (i === j ? d : x)))}
        onHapus={(i) => set(data.filter((_, j) => j !== i))}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          gap: 12,
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => set([...data, { label: "Kategori baru", nilai: 0 }])}
        >
          + Tambah baris
        </button>
        <span
          className="tnum"
          style={{
            fontSize: 13,
            color:
              Math.abs(total - 100) > 0.5
                ? "#a11"
                : "var(--color-neutral-700)",
          }}
        >
          Total {total.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function FormStatistik({ awal }: { awal: NilaiStatistik }) {
  const router = useRouter();
  const [f, setF] = useState(awal);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");

  const angkaField = (
    k:
      | "totalPenduduk"
      | "jumlahKk"
      | "lakiLaki"
      | "perempuan"
      | "luasWilayahHa"
      | "jumlahBekerja",
    label: string,
  ) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      <input
        id={k}
        className="input"
        type="number"
        min="0"
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: Number(e.target.value) })}
      />
    </div>
  );

  async function simpan() {
    setSibuk(true);
    setPesan("");
    const res = await fetch("/api/statistik", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const json = await res.json();
    setSibuk(false);
    if (!res.ok) {
      setPesan(
        json.detail?.map((d: { pesan: string }) => d.pesan).join(" · ") ??
          json.error ??
          "Gagal menyimpan",
      );
      return;
    }
    setPesan("Tersimpan. Halaman publik ikut terbarui.");
    router.refresh();
  }

  const totalDusun = f.perDusun.reduce(
    (a, d) => ({ jiwa: a.jiwa + d.jiwa, kk: a.kk + d.kk }),
    { jiwa: 0, kk: 0 },
  );
  const selisih = totalDusun.jiwa !== f.totalPenduduk;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          padding: "20px 40px",
          borderBottom: "2px solid var(--color-divider)",
          flexWrap: "wrap",
        }}
      >
        <p
          aria-live="polite"
          style={{
            margin: 0,
            fontSize: 13.5,
            fontWeight: 600,
            color: pesan.startsWith("Tersimpan")
              ? "var(--color-accent-700)"
              : "#a11",
          }}
        >
          {pesan}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={simpan}
          disabled={sibuk}
        >
          {sibuk ? "Menyimpan…" : "Simpan perubahan"}
        </button>
      </div>

      <section
        className="grid-4"
        style={{
          padding: "28px 40px",
          borderBottom: "2px solid var(--color-divider)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {angkaField("totalPenduduk", "Total penduduk")}
        {angkaField("jumlahKk", "Jumlah KK")}
        {angkaField("lakiLaki", "Laki-laki")}
        {angkaField("perempuan", "Perempuan")}
        {angkaField("jumlahBekerja", "Warga bekerja")}
      </section>

      <section
        style={{
          padding: "32px 40px",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 13,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--color-accent-700)",
            marginBottom: 20,
          }}
        >
          Penduduk per dusun
        </span>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Wilayah</th>
                <th>Jumlah jiwa</th>
                <th>Jumlah KK</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {f.perDusun.map((d, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className="input"
                      value={d.label}
                      aria-label="Nama wilayah"
                      onChange={(e) =>
                        setF({
                          ...f,
                          perDusun: f.perDusun.map((x, j) =>
                            i === j ? { ...x, label: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      style={{ width: 120 }}
                      value={d.jiwa}
                      aria-label={`Jiwa ${d.label}`}
                      onChange={(e) =>
                        setF({
                          ...f,
                          perDusun: f.perDusun.map((x, j) =>
                            i === j ? { ...x, jiwa: Number(e.target.value) } : x,
                          ),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      style={{ width: 120 }}
                      value={d.kk}
                      aria-label={`KK ${d.label}`}
                      onChange={(e) =>
                        setF({
                          ...f,
                          perDusun: f.perDusun.map((x, j) =>
                            i === j ? { ...x, kk: Number(e.target.value) } : x,
                          ),
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      aria-label={`Hapus ${d.label}`}
                      onClick={() =>
                        setF({
                          ...f,
                          perDusun: f.perDusun.filter((_, j) => j !== i),
                        })
                      }
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className="tnum">
                  <strong style={{ color: selisih ? "#a11" : undefined }}>
                    {totalDusun.jiwa}
                  </strong>
                </td>
                <td className="tnum">
                  <strong>{totalDusun.kk}</strong>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        {selisih && (
          <p style={{ fontSize: 13, color: "#a11", margin: "12px 0 0" }}>
            Jumlah per dusun ({totalDusun.jiwa}) belum sama dengan total
            penduduk ({f.totalPenduduk}).
          </p>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: 16 }}
          onClick={() =>
            setF({
              ...f,
              perDusun: [...f.perDusun, { label: "Wilayah baru", jiwa: 0, kk: 0 }],
            })
          }
        >
          + Tambah wilayah
        </button>
      </section>

      <section
        className="grid-2"
        style={{
          padding: "32px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
        }}
      >
        <Grup
          judul="Mata pencaharian (%)"
          data={f.mataPencaharian}
          set={(d) => setF({ ...f, mataPencaharian: d })}
        />
        <Grup
          judul="Pendidikan terakhir (%)"
          data={f.pendidikan}
          set={(d) => setF({ ...f, pendidikan: d })}
        />
        <Grup
          judul="Kelompok usia (%)"
          data={f.kelompokUsia}
          set={(d) => setF({ ...f, kelompokUsia: d })}
        />
      </section>
    </>
  );
}
