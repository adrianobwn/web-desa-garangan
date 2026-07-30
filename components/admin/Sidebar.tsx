"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const MENU = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/berita", label: "Berita" },
  { href: "/admin/agenda", label: "Agenda & Pengumuman" },
  { href: "/admin/galeri", label: "Galeri" },
  { href: "/admin/statistik", label: "Statistik penduduk" },
  { href: "/admin/pesan", label: "Pesan masuk" },
  { href: "/admin/audit", label: "Log aktivitas" },
];

export function Sidebar({ nama }: { nama: string }) {
  const pathname = usePathname();
  const inisial = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      style={{
        borderRight: "2px solid var(--color-divider)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        background: "var(--color-bg)",
      }}
    >
      {/* minHeight:0 + overflowY:auto — kalau menu bertambah panjang, yang
          menggulung hanya daftar menunya, bukan seluruh sidebar. */}
      <div style={{ minHeight: 0, overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "22px 20px",
            borderBottom: "2px solid var(--color-divider)",
          }}
        >
          <Image
            src="/lambang-boyolali.svg"
            alt="Lambang"
            width={19}
            height={28}
          />
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Admin Garangan
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", padding: "16px 0" }}>
          {MENU.map((m) => {
            const aktif =
              m.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={aktif ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 20px",
                  fontSize: 14.5,
                  textDecoration: "none",
                  borderLeft: `3px solid ${aktif ? "var(--color-accent)" : "transparent"}`,
                  background: aktif ? "var(--color-accent-100)" : undefined,
                  color: aktif ? "var(--color-accent-800)" : "var(--color-text)",
                  fontWeight: aktif ? 600 : 400,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    flex: "none",
                    background: aktif
                      ? "var(--color-accent)"
                      : "var(--color-neutral-400)",
                  }}
                />
                {m.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Jalan kembali ke situs publik — sebelumnya hanya ada di halaman
          Ringkasan, sehingga dari menu lain admin terasa "terkurung". */}
      <div style={{ marginTop: "auto" }}>
        {/* Tab yang sama: admin punya tombol "Kembali ke panel admin" di
            situs publik, jadi tidak perlu menumpuk tab baru. */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "12px 20px",
            borderTop: "2px solid var(--color-divider)",
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          Lihat situs publik
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        style={{
          padding: 20,
          borderTop: "2px solid var(--color-divider)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            flex: "none",
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {inisial}
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <p style={{ fontSize: 13.5, fontWeight: 600, margin: 0 }}>{nama}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              font: "inherit",
              fontSize: 12,
              color: "var(--color-accent-700)",
              cursor: "pointer",
            }}
          >
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}
