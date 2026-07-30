import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, ApiError, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { hapusGambar } from "@/lib/cloudinary";
import { segarkan } from "@/lib/revalidasi";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;

  const foto = await prisma.galeri.findUnique({ where: { id } });
  if (!foto) throw new ApiError(404, "Foto tidak ditemukan");

  await prisma.galeri.delete({ where: { id } });
  if (foto.publicId) await hapusGambar(foto.publicId);

  await catatAudit({
    userId: user.id,
    aksi: "DELETE",
    entitas: "Galeri",
    entitasId: id,
    ringkasan: `Menghapus foto "${foto.keterangan}"`,
    ip: ambilIp(req),
  });

  segarkan("/galeri");
  return NextResponse.json({ ok: true });
});
