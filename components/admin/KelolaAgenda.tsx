"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { tanggalPendek } from "@/lib/util";

type Agenda = {
  id: string;
  judul: string;
  tanggal: string;
  waktu: string | null;
  lokasi: string | null;
  rutin: boolean;
};
type Pengumuman = {
  id: string;
  judul: string;
  isi: string;
  kategori: string | null;
  disematkan: boolean;
  tanggal: string;
};

const KOSONG_AGENDA = {
  judul: "",
  tanggal: "",
  waktu: "",
  lokasi: "",
  deskripsi: "",
  rutin: false,
};
const KOSONG_PENGUMUMAN = {
  judul: "",
  isi: "",
  kategori: "",
  disematkan: false,
};

export function KelolaAgenda({
  agenda,
  pengumuman,
}: {
  agenda: Agenda[];
  pengumuman: Pengumuman[];
}) {
  const router = useRouter();
  const [formA, setFormA] = useState(KOSONG_AGENDA);
  const [formP, setFormP] = useState(KOSONG_PENGUMUMAN);
  const [pesanA, setPesanA] = useState("");
  const [pesanP, setPesanP] = useState("");
  const [sibuk, setSibuk] = useState(false);

  async function kirim(
    url: string,
    body: unknown,
    reset: () => void,
    setPesan: (v: string) => void,
  ) {
    setSibuk(true);
    setPesan("");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    reset();
    router.refresh();
  }

  async function hapus(url: string, nama: string, setPesan: (v: string) => void) {
    if (!confirm(`Hapus "${nama}"?`)) return;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      setPesan("Gagal menghapus");
      return;
    }
    router.refresh();
  }

  return (
    <div
      className="split"
      style={{ display: "grid", gridTemplateColumns: "6fr 6fr" }}
    >
      {/* Agenda */}
      <section
        style={{
          padding: "32px 40px",
          borderRight: "2px solid var(--color-divider)",
          minWidth: 0,
        }}
      >
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
          Agenda kegiatan
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label htmlFor="a-judul">Judul agenda</label>
            <input
              id="a-judul"
              className="input"
              value={formA.judul}
              onChange={(e) => setFormA({ ...formA, judul: e.target.value })}
              placeholder="Bersih desa & merti dusun"
            />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div className="field" style={{ flex: 1, minWidth: 150 }}>
              <label htmlFor="a-tanggal">Tanggal</label>
              <input
                id="a-tanggal"
                className="input"
                type="date"
                value={formA.tanggal}
                onChange={(e) => setFormA({ ...formA, tanggal: e.target.value })}
              />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label htmlFor="a-waktu">Waktu</label>
              <input
                id="a-waktu"
                className="input"
                value={formA.waktu}
                onChange={(e) => setFormA({ ...formA, waktu: e.target.value })}
                placeholder="07.00 WIB"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="a-lokasi">Lokasi</label>
            <input
              id="a-lokasi"
              className="input"
              value={formA.lokasi}
              onChange={(e) => setFormA({ ...formA, lokasi: e.target.value })}
              placeholder="Lapangan Dusun Garangan"
            />
          </div>
          <label
            htmlFor="a-rutin"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
          >
            <input
              id="a-rutin"
              type="checkbox"
              checked={formA.rutin}
              onChange={(e) => setFormA({ ...formA, rutin: e.target.checked })}
              style={{ accentColor: "var(--color-accent)" }}
            />
            Kegiatan rutin (bukan agenda khusus)
          </label>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sibuk}
              onClick={() =>
                kirim("/api/agenda", formA, () => setFormA(KOSONG_AGENDA), setPesanA)
              }
            >
              + Tambah agenda
            </button>
          </div>
          {pesanA && (
            <p
              role="alert"
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "#a11",
              }}
            >
              {pesanA}
            </p>
          )}
        </div>

        <div className="table-scroll" style={{ marginTop: 24 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Judul</th>
                <th>Jenis</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {agenda.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted" style={{ padding: 16 }}>
                    Belum ada agenda.
                  </td>
                </tr>
              )}
              {agenda.map((a) => (
                <tr key={a.id}>
                  <td className="tnum">{tanggalPendek(a.tanggal)}</td>
                  <td>
                    {a.judul}
                    <br />
                    <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                      {[a.waktu, a.lokasi].filter(Boolean).join(" · ")}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${a.rutin ? "tag-neutral" : "tag-accent"}`}>
                      {a.rutin ? "Rutin" : "Agenda"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => hapus(`/api/agenda/${a.id}`, a.judul, setPesanA)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pengumuman */}
      <section style={{ padding: "32px 40px", minWidth: 0 }}>
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
          Pengumuman
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label htmlFor="p-judul">Judul pengumuman</label>
            <input
              id="p-judul"
              className="input"
              value={formP.judul}
              onChange={(e) => setFormP({ ...formP, judul: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="p-isi">Isi</label>
            <textarea
              id="p-isi"
              className="input"
              rows={3}
              value={formP.isi}
              onChange={(e) => setFormP({ ...formP, isi: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="p-kategori">Kategori</label>
            <input
              id="p-kategori"
              className="input"
              value={formP.kategori}
              onChange={(e) => setFormP({ ...formP, kategori: e.target.value })}
              placeholder="Pemerintahan"
            />
          </div>
          <label
            htmlFor="p-sematkan"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
          >
            <input
              id="p-sematkan"
              type="checkbox"
              checked={formP.disematkan}
              onChange={(e) =>
                setFormP({ ...formP, disematkan: e.target.checked })
              }
              style={{ accentColor: "var(--color-accent)" }}
            />
            Sematkan di beranda
          </label>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sibuk}
              onClick={() =>
                kirim(
                  "/api/pengumuman",
                  formP,
                  () => setFormP(KOSONG_PENGUMUMAN),
                  setPesanP,
                )
              }
            >
              + Tambah pengumuman
            </button>
          </div>
          {pesanP && (
            <p
              role="alert"
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "#a11",
              }}
            >
              {pesanP}
            </p>
          )}
        </div>

        <div className="table-scroll" style={{ marginTop: 24 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Judul</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pengumuman.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-muted" style={{ padding: 16 }}>
                    Belum ada pengumuman.
                  </td>
                </tr>
              )}
              {pengumuman.map((p) => (
                <tr key={p.id}>
                  <td className="tnum">{tanggalPendek(p.tanggal)}</td>
                  <td>
                    {p.disematkan && (
                      <span className="tag tag-accent" style={{ marginRight: 6 }}>
                        Disematkan
                      </span>
                    )}
                    {p.judul}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => hapus(`/api/pengumuman/${p.id}`, p.judul, setPesanP)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
