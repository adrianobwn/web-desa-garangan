import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { paginasiSchema, pengumumanSchema } from "@/lib/validasi";
import { segarkan } from "@/lib/revalidasi";

export const GET = handler(async (req) => {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const { page, perPage } = paginasiSchema.parse(sp);

  const [items, total] = await Promise.all([
    prisma.pengumuman.findMany({
      orderBy: [{ disematkan: "desc" }, { tanggal: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.pengumuman.count(),
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
  const data = pengumumanSchema.parse(await req.json());

  const pengumuman = await prisma.pengumuman.create({ data });

  await catatAudit({
    userId: user.id,
    aksi: "CREATE",
    entitas: "Pengumuman",
    entitasId: pengumuman.id,
    ringkasan: `Menambah pengumuman "${pengumuman.judul}"`,
    ip: ambilIp(req),
  });

  segarkan("/agenda");
  return NextResponse.json(pengumuman, { status: 201 });
});
