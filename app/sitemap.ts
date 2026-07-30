import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { filterPublik } from "@/lib/queries";

const situs = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const berita = await prisma.berita.findMany({
    where: filterPublik(),
    select: { slug: true, updatedAt: true },
    orderBy: { tanggalTerbit: "desc" },
    take: 1000,
  });

  const statis: MetadataRoute.Sitemap = [
    { url: `${situs}/`, changeFrequency: "daily", priority: 1 },
    { url: `${situs}/berita`, changeFrequency: "daily", priority: 0.9 },
    { url: `${situs}/profil`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${situs}/agenda`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${situs}/statistik`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${situs}/galeri`, changeFrequency: "weekly", priority: 0.6 },
  ];

  return [
    ...statis,
    ...berita.map((b) => ({
      url: `${situs}/berita/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
