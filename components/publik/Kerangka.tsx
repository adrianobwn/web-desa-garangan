import Link from "next/link";
import { NavPublik } from "./NavPublik";
import { BilahAdmin } from "./BilahAdmin";
import { tanggalLengkap } from "@/lib/util";

function TopBar() {
  return (
    <div
      className="desktop-only pad"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px var(--pad)",
        borderBottom: "1px solid var(--color-neutral-300)",
        fontSize: 12.5,
        color: "var(--color-neutral-700)",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <span>Pemerintah Kabupaten Boyolali · Kecamatan Wonosamodro</span>
      <span className="tnum">
        {tanggalLengkap()} · Kantor buka 08.00–15.00
      </span>
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="footer-row"
      style={{
        borderTop: "2px solid var(--color-divider)",
        padding: "40px var(--pad)",
        display: "flex",
        justifyContent: "space-between",
        gap: 48,
        fontSize: 13,
        lineHeight: "22px",
        color: "var(--color-neutral-700)",
      }}
    >
      <div>
        <strong style={{ color: "var(--color-text)" }}>
          Pemerintah Desa Garangan
        </strong>
        <br />
        Kecamatan Wonosamodro, Kabupaten Boyolali, Jawa Tengah
      </div>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <Link href="/profil">Profil desa</Link>
        <Link href="/berita">Berita</Link>
        <Link href="/statistik">Statistik</Link>
        <Link href="/galeri">Galeri</Link>
        <Link href="/#kontak">Kontak</Link>
      </div>
      <div>© {new Date().getFullYear()} Pemdes Garangan · Dikelola oleh perangkat desa</div>
    </footer>
  );
}

/** Kerangka halaman publik: topbar + nav + konten + footer. */
export function Kerangka({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <a href="#konten" className="skip-link">
        Lewati ke konten utama
      </a>
      <BilahAdmin />
      <TopBar />
      <NavPublik />
      <main id="konten">{children}</main>
      <Footer />
    </div>
  );
}

/** Judul halaman + breadcrumb, pola berulang di semua halaman dalam. */
export function KepalaHalaman({
  judul,
  deskripsi,
  breadcrumb,
  aksi,
}: {
  judul: string;
  deskripsi?: string;
  breadcrumb: { href?: string; label: string }[];
  aksi?: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: "56px var(--pad) 48px",
        borderBottom: "2px solid var(--color-divider)",
      }}
    >
      <nav
        aria-label="Breadcrumb"
        style={{
          fontSize: 13,
          color: "var(--color-neutral-700)",
          marginBottom: 20,
        }}
      >
        {breadcrumb.map((b, i) => (
          <span key={b.label}>
            {i > 0 && <span style={{ margin: "0 6px" }}>/</span>}
            {b.href ? <Link href={b.href}>{b.label}</Link> : b.label}
          </span>
        ))}
      </nav>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 48,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            className="hero-title"
            style={{
              fontSize: 56,
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              margin: "0 0 0 -0.058em",
            }}
          >
            {judul}
          </h1>
          {deskripsi && (
            <p
              style={{
                fontSize: 16,
                lineHeight: "26px",
                color: "var(--color-neutral-800)",
                margin: "16px 0 0",
                maxWidth: "56ch",
              }}
            >
              {deskripsi}
            </p>
          )}
        </div>
        {aksi}
      </div>
    </section>
  );
}

/** Label kecil huruf kapital dengan warna aksen — dipakai di semua seksi. */
export function Kicker({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        display: "block",
        fontSize: 13,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "var(--color-accent-700)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
