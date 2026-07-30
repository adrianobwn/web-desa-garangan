import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell">
      <section
        style={{
          padding: "120px var(--pad)",
          minHeight: "60vh",
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
          Halaman tidak ditemukan
        </span>
        <h1
          className="hero-title"
          style={{ fontSize: 56, lineHeight: 1.06, letterSpacing: "-0.02em" }}
        >
          Halaman yang Anda cari tidak ada.
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: "26px",
            color: "var(--color-neutral-800)",
            margin: "16px 0 28px",
            maxWidth: "52ch",
          }}
        >
          Tautan mungkin salah ketik atau kontennya sudah dipindahkan. Kembali ke
          beranda atau telusuri berita desa.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            Kembali ke beranda
          </Link>
          <Link href="/berita" className="btn btn-secondary">
            Lihat berita desa
          </Link>
        </div>
      </section>
    </div>
  );
}
