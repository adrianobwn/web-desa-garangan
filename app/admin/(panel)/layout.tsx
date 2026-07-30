import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Layout panel admin. Middleware sudah memblokir yang belum login;
 * pemeriksaan di sini adalah lapis kedua sekaligus sumber data user.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesi = await auth();
  if (!sesi?.user) redirect("/admin/login");

  return (
    <div
      className="admin-shell"
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh",
      }}
    >
      {/* Sidebar menempel: konten panjang tidak boleh ikut menggulungnya. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "100vh",
        }}
      >
        <Sidebar nama={sesi.user.name ?? "Admin"} />
      </div>
      <main style={{ minWidth: 0 }}>{children}</main>
    </div>
  );
}
