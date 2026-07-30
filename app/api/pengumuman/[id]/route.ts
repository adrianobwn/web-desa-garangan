import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, ApiError, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { pengumumanSchema } from "@/lib/validasi";
import { segarkan } from "@/lib/revalidasi";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;
  const data = pengumumanSchema.parse(await req.json());

  const pengumuman = await prisma.pengumuman.update({ where: { id }, data });

  await catatAudit({
    userId: user.id,
    aksi: "UPDATE",
    entitas: "Pengumuman",
    entitasId: id,
    ringkasan: `Mengubah pengumuman "${pengumuman.judul}"`,
    ip: ambilIp(req),
  });

  segarkan("/agenda");
  return NextResponse.json(pengumuman);
});

export const DELETE = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;

  const pengumuman = await prisma.pengumuman.findUnique({ where: { id } });
  if (!pengumuman) throw new ApiError(404, "Pengumuman tidak ditemukan");

  await prisma.pengumuman.delete({ where: { id } });
  await catatAudit({
    userId: user.id,
    aksi: "DELETE",
    entitas: "Pengumuman",
    entitasId: id,
    ringkasan: `Menghapus pengumuman "${pengumuman.judul}"`,
    ip: ambilIp(req),
  });

  segarkan("/agenda");
  return NextResponse.json({ ok: true });
});
