import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { EditorBerita } from "@/components/admin/EditorBerita";
import { PeringatanUnggah } from "@/components/admin/PeringatanUnggah";
import { tanggalPendek } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function EditBerita({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [berita, kategori] = await Promise.all([
    prisma.berita.findUnique({ where: { id } }),
    prisma.kategori.findMany({ orderBy: { nama: "asc" } }),
  ]);
  if (!berita) notFound();

  return (
    <>
      <HeaderAdmin
        judul="Edit Berita"
        sub={`${berita.status === "TERBIT" ? "Terbit" : "Draf"} · terakhir diubah ${tanggalPendek(berita.updatedAt)}`}
      />
      <PeringatanUnggah />
      <EditorBerita
        kategori={kategori}
        awal={{
          id: berita.id,
          judul: berita.judul,
          ringkasan: berita.ringkasan,
          isi: berita.isi,
          kategoriId: berita.kategoriId,
          status: berita.status,
          gambarSampul: berita.gambarSampul,
          // <input type="date"> butuh format YYYY-MM-DD.
          tanggalTerbit:
            berita.tanggalTerbit?.toISOString().slice(0, 10) ?? null,
          tags: berita.tags,
          namaPenulis: berita.namaPenulis,
        }}
      />
    </>
  );
}
