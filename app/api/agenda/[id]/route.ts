import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, ApiError, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { agendaSchema } from "@/lib/validasi";
import { segarkan } from "@/lib/revalidasi";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;
  const data = agendaSchema.parse(await req.json());

  const agenda = await prisma.agenda.update({ where: { id }, data });

  await catatAudit({
    userId: user.id,
    aksi: "UPDATE",
    entitas: "Agenda",
    entitasId: id,
    ringkasan: `Mengubah agenda "${agenda.judul}"`,
    ip: ambilIp(req),
  });

  segarkan("/agenda");
  return NextResponse.json(agenda);
});

export const DELETE = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;

  const agenda = await prisma.agenda.findUnique({ where: { id } });
  if (!agenda) throw new ApiError(404, "Agenda tidak ditemukan");

  await prisma.agenda.delete({ where: { id } });
  await catatAudit({
    userId: user.id,
    aksi: "DELETE",
    entitas: "Agenda",
    entitasId: id,
    ringkasan: `Menghapus agenda "${agenda.judul}"`,
    ip: ambilIp(req),
  });

  segarkan("/agenda");
  return NextResponse.json({ ok: true });
});
