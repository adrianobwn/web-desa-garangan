import Link from "next/link";
import { auth } from "@/auth";

/**
 * Bilah tipis di atas situs publik, hanya tampil bila admin sedang login.
 * Tanpa ini, admin yang menekan "Lihat situs publik" tidak punya jalan
 * kembali selain menekan tombol Back browser.
 */
export async function BilahAdmin() {
  const sesi = await auth();
  if (!sesi?.user) return null;

  return (
    <div
      style={{
        background: "var(--color-neutral-900)",
        color: "var(--color-bg)",
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "8px var(--pad)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ opacity: 0.8 }}>
          Masuk sebagai <strong>{sesi.user.name}</strong> · tampilan publik
        </span>
        <Link
          href="/admin"
          style={{
            color: "var(--color-bg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            fontWeight: 600,
          }}
        >
          ← Kembali ke panel admin
        </Link>
      </div>
    </div>
  );
}
