import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const situs = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(situs),
  title: {
    default: "Desa Garangan — Portal Resmi Pemerintah Desa",
    template: "%s · Desa Garangan",
  },
  description:
    "Portal resmi Desa Garangan, Kecamatan Wonosamodro, Kabupaten Boyolali: berita desa, pengumuman, agenda, statistik penduduk, dan galeri kegiatan.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Desa Garangan",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={archivo.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
