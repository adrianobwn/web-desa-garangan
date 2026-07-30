import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ambilIp, catatAudit, handler, wajibAdmin } from "@/lib/api";

const schema = z.object({ statusDibalas: z.boolean() });

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;
  const { statusDibalas } = schema.parse(await req.json());

  const pesan = await prisma.pesanKontak.update({
    where: { id },
    data: { statusDibalas },
  });

  await catatAudit({
    userId: user.id,
    aksi: "UPDATE",
    entitas: "PesanKontak",
    entitasId: id,
    ringkasan: `Menandai pesan dari ${pesan.nama} sebagai ${statusDibalas ? "sudah" : "belum"} dibalas`,
    ip: ambilIp(req),
  });

  return NextResponse.json(pesan);
});

export const DELETE = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;

  const pesan = await prisma.pesanKontak.delete({ where: { id } });
  await catatAudit({
    userId: user.id,
    aksi: "DELETE",
    entitas: "PesanKontak",
    entitasId: id,
    ringkasan: `Menghapus pesan dari ${pesan.nama}`,
    ip: ambilIp(req),
  });

  return NextResponse.json({ ok: true });
});
