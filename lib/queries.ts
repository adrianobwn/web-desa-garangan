import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

/** Distribusi statistik disimpan sebagai JSON — bentuknya dipakai di banyak tempat. */
export type Distribusi = { label: string; nilai: number; jumlah?: number };
export type PerDusun = { label: string; jiwa: number; kk: number };

/**
 * Filter baku berita publik: hanya yang terbit dan tanggalnya sudah lewat.
 *
 * HARUS berupa fungsi. Kalau `new Date()` dievaluasi sekali saat modul dimuat,
 * batas waktunya membeku di waktu server start — berita yang diterbitkan
 * setelah itu tidak akan pernah muncul sampai server di-restart.
 */
export const filterPublik = (): Prisma.BeritaWhereInput => ({
  status: "TERBIT",
  tanggalTerbit: { lte: new Date() },
});

export function whereBerita(opsi: {
  q?: string;
  kategori?: string;
  bulan?: string;
  status?: "DRAF" | "TERBIT";
  publik?: boolean;
}): Prisma.BeritaWhereInput {
  const where: Prisma.BeritaWhereInput = opsi.publik
    ? { ...filterPublik() }
    : opsi.status
      ? { status: opsi.status }
      : {};

  if (opsi.q) {
    where.OR = [
      { judul: { contains: opsi.q, mode: "insensitive" } },
      { ringkasan: { contains: opsi.q, mode: "insensitive" } },
    ];
  }
  if (opsi.kategori) where.kategori = { slug: opsi.kategori };
  if (opsi.bulan) {
    const [th, bl] = opsi.bulan.split("-").map(Number);
    where.tanggalTerbit = {
      gte: new Date(th, bl - 1, 1),
      lt: new Date(th, bl, 1),
    };
  }
  return where;
}

/** Paginasi server-side — daftar besar tidak pernah dikirim utuh ke klien. */
export async function daftarBerita(opsi: {
  page: number;
  perPage: number;
  q?: string;
  kategori?: string;
  bulan?: string;
  status?: "DRAF" | "TERBIT";
  publik?: boolean;
}) {
  const where = whereBerita(opsi);
  const [items, total] = await Promise.all([
    prisma.berita.findMany({
      where,
      orderBy: [{ tanggalTerbit: "desc" }, { createdAt: "desc" }],
      skip: (opsi.page - 1) * opsi.perPage,
      take: opsi.perPage,
      select: {
        id: true,
        slug: true,
        judul: true,
        ringkasan: true,
        gambarSampul: true,
        tanggalTerbit: true,
        dibaca: true,
        status: true,
        kategori: { select: { nama: true, slug: true } },
        penulis: { select: { nama: true } },
      },
    }),
    prisma.berita.count({ where }),
  ]);

  return {
    items,
    total,
    page: opsi.page,
    perPage: opsi.perPage,
    totalHalaman: Math.max(1, Math.ceil(total / opsi.perPage)),
  };
}

export function statistik() {
  return prisma.statistik.findUnique({ where: { id: "singleton" } });
}

export function pengumumanTerbaru(take = 4) {
  return prisma.pengumuman.findMany({
    orderBy: [{ disematkan: "desc" }, { tanggal: "desc" }],
    take,
  });
}

export function agendaMendatang(take = 3) {
  const awalHariIni = new Date();
  awalHariIni.setHours(0, 0, 0, 0);
  return prisma.agenda.findMany({
    where: { tanggal: { gte: awalHariIni } },
    orderBy: { tanggal: "asc" },
    take,
  });
}

/** Arsip per bulan untuk sidebar berita — dihitung di database. */
export async function arsipBulan(): Promise<
  { bulan: string; jumlah: number }[]
> {
  const rows = await prisma.$queryRaw<{ bulan: string; jumlah: bigint }[]>`
    SELECT to_char("tanggalTerbit", 'YYYY-MM') AS bulan, COUNT(*) AS jumlah
    FROM "Berita"
    WHERE status = 'TERBIT' AND "tanggalTerbit" <= NOW()
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 12
  `;
  return rows.map((r) => ({ bulan: r.bulan, jumlah: Number(r.jumlah) }));
}

export async function kategoriDenganJumlah() {
  const kategori = await prisma.kategori.findMany({
    orderBy: { nama: "asc" },
    select: {
      id: true,
      nama: true,
      slug: true,
      _count: { select: { berita: { where: filterPublik() } } },
    },
  });
  return kategori.map((k) => ({ ...k, jumlah: k._count.berita }));
}
