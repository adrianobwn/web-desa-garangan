import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { beritaQuerySchema, beritaSchema } from "@/lib/validasi";
import { bersihkanHtml } from "@/lib/sanitasi";
import { daftarBerita } from "@/lib/queries";
import { slugify } from "@/lib/util";
import { segarkanBerita } from "@/lib/revalidasi";
import { auth } from "@/auth";

/** GET /api/berita — daftar. Publik hanya melihat yang berstatus TERBIT. */
export const GET = handler(async (req) => {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const q = beritaQuerySchema.parse(sp);
  const sesi = await auth();

  const hasil = await daftarBerita({
    ...q,
    publik: !sesi?.user,
    status: sesi?.user ? q.status : undefined,
  });
  return NextResponse.json(hasil);
});

/** POST /api/berita — buat berita baru (admin). */
export const POST = handler(async (req) => {
  const user = await wajibAdmin();
  const data = beritaSchema.parse(await req.json());

  // Slug unik: tambah akhiran angka kalau bentrok.
  const dasar = slugify(data.judul);
  let slug = dasar;
  for (let i = 2; await prisma.berita.findUnique({ where: { slug } }); i++) {
    slug = `${dasar}-${i}`;
  }

  const berita = await prisma.berita.create({
    data: {
      slug,
      judul: data.judul,
      ringkasan: data.ringkasan,
      isi: bersihkanHtml(data.isi), // sanitasi sebelum simpan
      kategoriId: data.kategoriId,
      status: data.status,
      gambarSampul: data.gambarSampul || null,
      tanggalTerbit:
        data.status === "TERBIT"
          ? (data.tanggalTerbit ?? new Date())
          : (data.tanggalTerbit ?? null),
      tags: data.tags,
      penulisId: user.id,
    },
  });

  await catatAudit({
    userId: user.id,
    aksi: "CREATE",
    entitas: "Berita",
    entitasId: berita.id,
    ringkasan: `Membuat berita "${berita.judul}"`,
    ip: ambilIp(req),
  });

  segarkanBerita(berita.slug);
  return NextResponse.json(berita, { status: 201 });
});
