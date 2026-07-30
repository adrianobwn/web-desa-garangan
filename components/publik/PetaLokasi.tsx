// Peta lokasi Kantor Desa Garangan.
//
// Koordinat presisi diambil dari pin resmi Google Maps kantor desa
// (maps.app.goo.gl/34AHEy6L6a6ov7Q66). Memakai mode "q=" sehingga tidak
// butuh API key. Zoom 17 agar bangunan kantor terlihat jelas.
const NAMA = "Kantor Desa Garangan";
const KOORDINAT = "-7.2849789,110.6511446";
const PETA_SRC = `https://www.google.com/maps?q=${KOORDINAT}&z=17&output=embed`;
const PETA_TAUTAN = `https://www.google.com/maps/search/?api=1&query=${KOORDINAT}`;
const RUTE = `https://www.google.com/maps/dir/?api=1&destination=${KOORDINAT}`;

export function PetaLokasi() {
  return (
    <>
      {/* Judul sendiri: label bawaan Google di pojok peta sering tertutup
          tombol "Buka di Maps", jadi nama lokasi ditulis di luar bingkai. */}
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 14.5,
          fontWeight: 600,
        }}
      >
        {NAMA}
      </p>
      <div
        style={{
          border: "2px solid var(--color-divider)",
          height: 300,
          overflow: "hidden",
          background: "var(--color-neutral-200)",
        }}
      >
        <iframe
          src={PETA_SRC}
          title={`Peta lokasi ${NAMA}`}
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <a
          className="btn btn-secondary"
          href={RUTE}
          target="_blank"
          rel="noopener noreferrer"
        >
          Petunjuk arah ↗
        </a>
        <a
          className="btn btn-ghost"
          href={PETA_TAUTAN}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buka di Google Maps ↗
        </a>
      </div>
    </>
  );
}
