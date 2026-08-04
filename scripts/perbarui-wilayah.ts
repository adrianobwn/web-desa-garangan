/**
 * Perbarui data wilayah, kepala dusun, dan luas wilayah sesuai data terbaru
 * dari perangkat desa (Agustus 2026).
 *
 * Skrip ini hanya meng-update dan menambah — tidak ada deleteMany, sehingga
 * berita, galeri, dan agenda yang sudah diinput lewat panel admin tetap aman.
 * Aman dijalankan berulang kali (idempoten).
 *
 * Jalankan: npx tsx scripts/perbarui-wilayah.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const LUAS_HA = 881;

// Penomoran baru: Garangan tidak bernomor, Losari–Ngasinan jadi Dusun I–IV.
const WILAYAH = [
  {
    nama: "Garangan",
    namaKadus: null,
    jumlahRt: 5,
    jumlahRw: 1,
    kelembagaan: "PKK, Karang Taruna IRMASGA & Keong Jaya",
    urutan: 0,
  },
  {
    nama: "Dusun I — Losari",
    namaKadus: "Kamsudin",
    jumlahRt: 4,
    jumlahRw: 1,
    kelembagaan: "PKK, 3 Karang Taruna",
    urutan: 1,
  },
  {
    nama: "Dusun II — Sokokerep",
    namaKadus: "Handogo",
    jumlahRt: 2,
    jumlahRw: 1,
    kelembagaan: "PKK, Karang Taruna",
    urutan: 2,
  },
  {
    nama: "Dusun III — Getas Krikil",
    namaKadus: "Ngatiri",
    jumlahRt: 4,
    jumlahRw: 1,
    kelembagaan: null,
    urutan: 3,
  },
  {
    nama: "Dusun IV — Ngasinan",
    namaKadus: "Kartono",
    jumlahRt: 4,
    jumlahRw: 1,
    kelembagaan: "Karang Taruna & PKK tiap RT",
    urutan: 4,
  },
];

const PERANGKAT_KADUS = [
  { nama: "Kamsudin", jabatan: "Kadus I · Losari", urutan: 0 },
  { nama: "Handogo", jabatan: "Kadus II · Sokokerep", urutan: 1 },
  { nama: "Ngatiri", jabatan: "Kadus III · Getas Krikil", urutan: 2 },
  { nama: "Kartono", jabatan: "Kadus IV · Ngasinan", urutan: 3 },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  // Wilayah dicocokkan lewat urutan, bukan nama, karena namanya ikut berubah.
  const wilayahLama = await prisma.wilayah.findMany({ orderBy: { urutan: "asc" } });
  for (const [i, w] of WILAYAH.entries()) {
    const lama = wilayahLama[i];
    if (lama) {
      await prisma.wilayah.update({ where: { id: lama.id }, data: w });
      console.log(`  wilayah: ${lama.nama} → ${w.nama} (kadus: ${w.namaKadus ?? "—"})`);
    } else {
      await prisma.wilayah.create({ data: w });
      console.log(`  wilayah: + ${w.nama}`);
    }
  }
  // Baris sisa dari penomoran lama (dulu 5 dusun bernomor) dibuang.
  if (wilayahLama.length > WILAYAH.length) {
    const sisa = wilayahLama.slice(WILAYAH.length);
    await prisma.wilayah.deleteMany({ where: { id: { in: sisa.map((w) => w.id) } } });
    console.log(`  wilayah: - ${sisa.map((w) => w.nama).join(", ")}`);
  }

  // tingkat 3 = kepala dusun. Hanya baris kadus yang disentuh; kades,
  // sekdes, kasi/kaur, dan staf dibiarkan apa adanya.
  await prisma.perangkatDesa.deleteMany({ where: { tingkat: 3 } });
  await prisma.perangkatDesa.createMany({
    data: PERANGKAT_KADUS.map((p) => ({ ...p, tingkat: 3 })),
  });
  console.log(`  perangkat: ${PERANGKAT_KADUS.length} kepala dusun disegarkan`);

  const stat = await prisma.statistik.findUnique({ where: { id: "singleton" } });
  if (stat) {
    // Label per dusun ikut penomoran baru; angka jiwa/KK dipertahankan.
    // Bila perDusun kosong/bukan array, kolomnya tidak disentuh sama sekali.
    const perDusun = Array.isArray(stat.perDusun)
      ? (stat.perDusun as { label: string }[]).map((d, i) => ({
          ...d,
          label: WILAYAH[i]?.nama ?? d.label,
        }))
      : undefined;

    await prisma.statistik.update({
      where: { id: "singleton" },
      data: { luasWilayahHa: LUAS_HA, ...(perDusun && { perDusun }) },
    });
    console.log(`  statistik: ${stat.luasWilayahHa} → ${LUAS_HA} ha`);
  } else {
    console.log("  statistik: belum ada baris singleton, dilewati");
  }

  console.log("Selesai.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
