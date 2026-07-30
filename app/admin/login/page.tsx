import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default async function HalamanLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sesi = await auth();
  if (sesi?.user) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div
      className="split"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "5fr 7fr",
      }}
    >
      <div
        style={{
          padding: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 48,
          borderRight: "2px solid var(--color-divider)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/lambang-boyolali.svg"
            alt="Lambang Kabupaten Boyolali"
            width={22}
            height={32}
          />
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            Desa Garangan · Admin
          </span>
        </div>

        <div style={{ maxWidth: 380 }}>
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
            Panel administrasi
          </span>
          <h1
            style={{
              fontSize: 42,
              lineHeight: 1.12,
              letterSpacing: "-0.015em",
              margin: "0 0 0 -0.045em",
            }}
          >
            Masuk untuk mengelola konten desa.
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: "24px",
              color: "var(--color-neutral-800)",
              margin: "24px 0 0",
            }}
          >
            Kelola berita, agenda, pengumuman, galeri, dan data statistik Desa
            Garangan. Akun disediakan oleh admin sistem — hubungi sekretaris desa
            bila lupa kata sandi.
          </p>

          <FormLogin errorAwal={error} />
        </div>

        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>
          © {new Date().getFullYear()} Pemerintah Desa Garangan · Portal
          internal, bukan untuk publik
        </p>
      </div>

      <figure className="grayscale desktop-only" style={{ margin: 0 }}>
        <div
          style={{
            background: "var(--color-neutral-300)",
            height: "100%",
            minHeight: "100vh",
            display: "flex",
            alignItems: "flex-end",
            padding: 40,
            color: "var(--color-neutral-700)",
            fontSize: 13,
            letterSpacing: ".06em",
            textTransform: "uppercase",
          }}
        >
          Foto: Kantor Desa Garangan
        </div>
      </figure>
    </div>
  );
}
