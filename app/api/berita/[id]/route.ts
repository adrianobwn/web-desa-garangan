import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, ApiError, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { beritaSchema } from "@/lib/validasi";
import { bersihkanHtml } from "@/lib/sanitasi";
import { hapusGambar } from "@/lib/cloudinary";
import { segarkanBerita } from "@/lib/revalidasi";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req, { params }: Ctx) => {
  await wajibAdmin();
  const { id } = await params;
  const berita = await prisma.berita.findUnique({
    where: { id },
    include: { kategori: true },
  });
  if (!berita) throw new ApiError(404, "Berita tidak ditemukan");
  return NextResponse.json(berita);
});

export const PUT = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;
  const data = beritaSchema.parse(await req.json());

  const sebelum = await prisma.berita.findUnique({ where: { id } });
  if (!sebelum) throw new ApiError(404, "Berita tidak ditemukan");

  const berita = await prisma.berita.update({
    where: { id },
    data: {
      judul: data.judul,
      ringkasan: data.ringkasan,
      isi: bersihkanHtml(data.isi),
      kategoriId: data.kategoriId,
      status: data.status,
      gambarSampul: data.gambarSampul || null,
      // Terbit pertama kali tanpa tanggal eksplisit → pakai waktu sekarang.
      tanggalTerbit:
        data.tanggalTerbit ??
        (data.status === "TERBIT" && !sebelum.tanggalTerbit
          ? new Date()
          : sebelum.tanggalTerbit),
      tags: data.tags,
    },
  });

  await catatAudit({
    userId: user.id,
    aksi: "UPDATE",
    entitas: "Berita",
    entitasId: id,
    ringkasan: `Mengubah berita "${berita.judul}"${sebelum.status !== berita.status ? ` (status ${sebelum.status} → ${berita.status})` : ""}`,
    ip: ambilIp(req),
  });

  segarkanBerita(berita.slug);
  return NextResponse.json(berita);
});

export const DELETE = handler(async (req, { params }: Ctx) => {
  const user = await wajibAdmin();
  const { id } = await params;

  const berita = await prisma.berita.findUnique({ where: { id } });
  if (!berita) throw new ApiError(404, "Berita tidak ditemukan");

  await prisma.berita.delete({ where: { id } });
  if (berita.gambarSampul) {
    const publicId = berita.gambarSampul
      .split("/upload/")[1]
      ?.replace(/^v\d+\//, "")
      .replace(/\.[a-z]+$/i, "");
    if (publicId) await hapusGambar(publicId);
  }

  await catatAudit({
    userId: user.id,
    aksi: "DELETE",
    entitas: "Berita",
    entitasId: id,
    ringkasan: `Menghapus berita "${berita.judul}"`,
    ip: ambilIp(req),
  });

  segarkanBerita(berita.slug);
  return NextResponse.json({ ok: true });
});
