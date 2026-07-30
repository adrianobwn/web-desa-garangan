import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { statistikSchema } from "@/lib/validasi";
import { segarkan } from "@/lib/revalidasi";

export const GET = handler(async () => {
  const stat = await prisma.statistik.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(stat);
});

/** PUT /api/statistik — satu-satunya sumber angka; halaman publik ikut ini. */
export const PUT = handler(async (req) => {
  const user = await wajibAdmin();
  const data = statistikSchema.parse(await req.json());

  const stat = await prisma.statistik.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  await catatAudit({
    userId: user.id,
    aksi: "UPDATE",
    entitas: "Statistik",
    entitasId: "singleton",
    ringkasan: `Memperbarui statistik penduduk (total ${data.totalPenduduk} jiwa)`,
    ip: ambilIp(req),
  });

  segarkan("/statistik");
  return NextResponse.json(stat);
});
