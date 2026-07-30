import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { EditorBerita } from "@/components/admin/EditorBerita";
import { PeringatanUnggah } from "@/components/admin/PeringatanUnggah";

export const dynamic = "force-dynamic";

export default async function BeritaBaru() {
  const kategori = await prisma.kategori.findMany({ orderBy: { nama: "asc" } });

  return (
    <>
      <HeaderAdmin judul="Tulis Berita" sub="Berita baru" />
      <PeringatanUnggah />
      <EditorBerita
        kategori={kategori}
        awal={{
          judul: "",
          ringkasan: "",
          isi: "<p></p>",
          kategoriId: kategori[0]?.id ?? "",
          status: "DRAF",
          gambarSampul: null,
          tanggalTerbit: null,
          tags: [],
        }}
      />
    </>
  );
}
