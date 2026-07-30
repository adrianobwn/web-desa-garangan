/**
 * Peringatan bahwa penyimpanan gambar belum disetel.
 *
 * Tanpa ini, admin hanya melihat pesan error saat mencoba unggah tanpa tahu
 * apa yang harus dilakukan. Komponen ini otomatis hilang begitu kredensial
 * Cloudinary terisi di .env.
 */
export function PeringatanUnggah() {
  if (process.env.CLOUDINARY_API_KEY) return null;

  return (
    <div
      role="alert"
      style={{
        margin: "24px 40px 0",
        border: "2px solid #a11",
        background: "#fdeaea",
        padding: "16px 20px",
      }}
    >
      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#a11" }}>
        Unggah foto belum bisa digunakan
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 13.5,
          lineHeight: "21px",
          color: "var(--color-neutral-800)",
        }}
      >
        Penyimpanan gambar belum disetel, sehingga foto yang dipilih akan
        ditolak. Daftar gratis di{" "}
        <strong>cloudinary.com</strong>, lalu salin <em>Cloud name</em>,{" "}
        <em>API Key</em>, dan <em>API Secret</em> ke berkas{" "}
        <code>.env</code>. Setelah server dijalankan ulang, peringatan ini
        hilang sendiri.
      </p>
    </div>
  );
}
