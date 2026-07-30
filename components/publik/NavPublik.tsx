"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/berita", label: "Berita" },
  { href: "/agenda", label: "Agenda" },
  { href: "/#potensi", label: "Potensi" },
  { href: "/statistik", label: "Statistik" },
  { href: "/galeri", label: "Galeri" },
  { href: "/#kontak", label: "Kontak" },
];

export function NavPublik() {
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);

  // Tautan berjangkar ("/#potensi") menunjuk ke bagian di beranda, bukan
  // halaman sendiri — jangan pernah ditandai aktif. Tanpa ini, split("#")
  // menyisakan "/" dan startsWith("/") membuatnya selalu hijau di semua rute.
  const aktif = (href: string) => {
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop / tablet */}
      <nav
        className="desktop-only pad"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "12px var(--pad)",
          borderBottom: "2px solid var(--color-divider)",
          flexWrap: "wrap",
        }}
      >
        <Image
          src="/lambang-boyolali.svg"
          alt="Lambang Kabupaten Boyolali"
          width={36}
          height={36}
          style={{ height: 36, width: "auto" }}
        />
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: 18,
            marginRight: "auto",
            color: "var(--color-text)",
            textDecoration: "none",
          }}
        >
          Desa Garangan
        </Link>
        {/* Menu dikelompokkan agar jaraknya rata dan tidak menempel tepi. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-6)",
            flexWrap: "wrap",
          }}
        >
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              aria-current={aktif(m.href) ? "page" : undefined}
              style={{
                fontSize: 14,
                textDecoration: "none",
                color: aktif(m.href)
                  ? "var(--color-accent)"
                  : "var(--color-text)",
              }}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile 390 */}
      <nav
        className="mobile-only"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px var(--pad)",
          borderBottom: "2px solid var(--color-divider)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "var(--color-text)",
          }}
        >
          <Image
            src="/lambang-boyolali.svg"
            alt="Lambang Kabupaten Boyolali"
            width={24}
            height={24}
            style={{ height: 24, width: "auto" }}
          />
          <span
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14 }}
          >
            Garangan
          </span>
        </Link>
        <button
          type="button"
          className="btn btn-icon"
          aria-label="Buka menu"
          aria-expanded={buka}
          onClick={() => setBuka((v) => !v)}
          style={{ width: 44, height: 44, fontSize: 18 }}
        >
          {buka ? "✕" : "☰"}
        </button>
      </nav>
      {buka && (
        <div
          className="mobile-only"
          style={{ borderBottom: "2px solid var(--color-divider)" }}
        >
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => setBuka(false)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: 44,
                padding: "14px var(--pad)",
                borderBottom: "1px solid var(--color-neutral-300)",
                textDecoration: "none",
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              {m.label}
              <span style={{ color: "var(--color-accent)" }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
