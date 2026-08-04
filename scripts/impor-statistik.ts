/**
 * Impor statistik penduduk dari hasil olah FORM 1 DATA GARANGAN.
 * Hanya angka agregat yang masuk — tidak ada nama, NIK, atau data pribadi.
 * Jalankan: npx tsx scripts/impor-statistik.ts /tmp/stat-input.json
 */
import "dotenv/config";
import fs from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

async function main() {
  const berkas = process.argv[2];
  if (!berkas) throw new Error("Sertakan path berkas JSON hasil olahan.");
  const d = JSON.parse(fs.readFileSync(berkas, "utf8"));

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const lama = await prisma.statistik.findUnique({ where: { id: "singleton" } });
  const data = {
    totalPenduduk: d.totalPenduduk,
    jumlahKk: d.jumlahKk,
    lakiLaki: d.lakiLaki,
    perempuan: d.perempuan,
    luasWilayahHa: d.luasWilayahHa ?? 881,
    jumlahBekerja: d.jumlahBekerja ?? 0,
    kelompokUsia: d.kelompokUsia,
    pendidikan: d.pendidikan,
    mataPencaharian: d.mataPencaharian,
    // perDusun dipertahankan bila berkas sumber tidak memuatnya.
    perDusun: d.perDusun?.length ? d.perDusun : (lama?.perDusun ?? []),
  };

  await prisma.statistik.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  console.log("Statistik diperbarui:");
  console.log(`  ${lama?.totalPenduduk ?? "-"} → ${data.totalPenduduk} jiwa`);
  console.log(`  ${lama?.jumlahKk ?? "-"} → ${data.jumlahKk} KK`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
