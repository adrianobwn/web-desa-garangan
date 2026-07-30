import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { KelolaGaleri } from "@/components/admin/KelolaGaleri";
import { PeringatanUnggah } from "@/components/admin/PeringatanUnggah";

export const dynamic = "force-dynamic";

export default async function AdminGaleri({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const kategori = typeof sp.kategori === "string" ? sp.kategori : undefined;
  const where = kategori ? { kategori } : {};

  const [foto, total, album] = await Promise.all([
    prisma.galeri.findMany({
      where,
      orderBy: { tanggalUnggah: "desc" },
      take: 60,
    }),
    prisma.galeri.count(),
    prisma.galeri.groupBy({ by: ["kategori"] }),
  ]);

  return (
    <>
      <HeaderAdmin
        judul="Galeri"
        sub={`${total} foto · ${album.length} album`}
      />
      <PeringatanUnggah />
      <KelolaGaleri foto={foto} kategoriAktif={kategori} />
    </>
  );
}
