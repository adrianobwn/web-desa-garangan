import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { agendaSchema, paginasiSchema } from "@/lib/validasi";
import { segarkan } from "@/lib/revalidasi";

export const GET = handler(async (req) => {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const { page, perPage } = paginasiSchema.parse(sp);

  const [items, total] = await Promise.all([
    prisma.agenda.findMany({
      orderBy: { tanggal: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.agenda.count(),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    totalHalaman: Math.max(1, Math.ceil(total / perPage)),
  });
});

export const POST = handler(async (req) => {
  const user = await wajibAdmin();
  const data = agendaSchema.parse(await req.json());

  const agenda = await prisma.agenda.create({ data });

  await catatAudit({
    userId: user.id,
    aksi: "CREATE",
    entitas: "Agenda",
    entitasId: agenda.id,
    ringkasan: `Menambah agenda "${agenda.judul}"`,
    ip: ambilIp(req),
  });

  segarkan("/agenda");
  return NextResponse.json(agenda, { status: 201 });
});
