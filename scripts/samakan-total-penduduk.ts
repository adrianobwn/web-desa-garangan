/**
 * Samakan total penduduk dengan penjumlahan rincian per dusun.
 *
 * Sebelumnya total tercatat 3.848 jiwa / 1.224 KK, sedangkan penjumlahan
 * per dusun 3.840 jiwa / 1.208 KK. Rincian per dusun dipakai sebagai acuan
 * karena berasal dari pencatatan tiap wilayah; totalnya yang disesuaikan.
 *
 * Rincian per dusun tidak diubah sama sekali.
 *
 * Jalankan: npx tsx scripts/samakan-total-penduduk.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

type BarisDusun = { label: string; jiwa: number; kk: number };

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const stat = await prisma.statistik.findUnique({ where: { id: "singleton" } });
  if (!stat) throw new Error("Baris statistik singleton belum ada.");
  if (!Array.isArray(stat.perDusun)) throw new Error("perDusun bukan array.");

  const dusun = stat.perDusun as unknown as BarisDusun[];
  const totalJiwa = dusun.reduce((a, d) => a + d.jiwa, 0);
  const totalKk = dusun.reduce((a, d) => a + d.kk, 0);

  // Rasio laki-laki/perempuan lama dipertahankan, lalu dibulatkan agar
  // jumlahnya persis sama dengan total baru — bukan meleset satu jiwa.
  const lamaLP = stat.lakiLaki + stat.perempuan;
  const lakiLaki = Math.round((stat.lakiLaki / lamaLP) * totalJiwa);
  const perempuan = totalJiwa - lakiLaki;

  await prisma.statistik.update({
    where: { id: "singleton" },
    data: { totalPenduduk: totalJiwa, jumlahKk: totalKk, lakiLaki, perempuan },
  });

  console.log(`  total : ${stat.totalPenduduk} → ${totalJiwa} jiwa`);
  console.log(`  KK    : ${stat.jumlahKk} → ${totalKk}`);
  console.log(`  L / P : ${stat.lakiLaki}/${stat.perempuan} → ${lakiLaki}/${perempuan}`);
  console.log(`  cek   : ${lakiLaki} + ${perempuan} = ${lakiLaki + perempuan}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
