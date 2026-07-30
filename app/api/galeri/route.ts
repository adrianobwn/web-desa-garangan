import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { galeriSchema, paginasiSchema } from "@/lib/validasi";
import { segarkan } from "@/lib/revalidasi";

export const GET = handler(async (req) => {
  const url = new URL(req.url);
  const sp = Object.fromEntries(url.searchParams);
  const { page, perPage } = paginasiSchema.parse(sp);
  const kategori = url.searchParams.get("kategori") ?? undefined;
  const where = kategori ? { kategori } : {};

  const [items, total] = await Promise.all([
    prisma.galeri.findMany({
      where,
      orderBy: { tanggalUnggah: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.galeri.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    totalHalaman: Math.max(1, Math.ceil(total / perPage)),
  });
});

/** POST /api/galeri — daftarkan foto yang sudah diunggah lewat /api/upload. */
export const POST = handler(async (req) => {
  const user = await wajibAdmin();
  const data = galeriSchema.parse(await req.json());

  const foto = await prisma.galeri.create({ data });

  await catatAudit({
    userId: user.id,
    aksi: "CREATE",
    entitas: "Galeri",
    entitasId: foto.id,
    ringkasan: `Menambah foto "${foto.keterangan}"`,
    ip: ambilIp(req),
  });

  segarkan("/galeri");
  return NextResponse.json(foto, { status: 201 });
});
