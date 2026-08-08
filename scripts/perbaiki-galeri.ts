/**
 * Ganti keterangan galeri yang masih berupa nama berkas mentah ("IMG_6971",
 * "IMG 5604 from Google Drive") dengan keterangan yang terbaca warga.
 * Kategori ikut dibetulkan: foto ladang, jalan, dan permukiman sebelumnya
 * masuk "Kegiatan warga".
 *
 * Dicocokkan lewat publicId Cloudinary, bukan keterangan, supaya aman
 * dijalankan ulang setelah keterangannya berubah.
 *
 * Jalankan: npx tsx scripts/perbaiki-galeri.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

// Keterangan disusun dari isi fotonya masing-masing, bukan tebakan.
const PERBAIKAN: { cocok: string; kategori: string; keterangan: string }[] = [
  {
    cocok: "ngvdw9ssbqugh9mqk65s",
    kategori: "Kegiatan warga",
    keterangan: "Senam sehat B2SA bersama ibu-ibu PKK di lapangan desa",
  },
  {
    cocok: "seved0vta79ttmjbxb2d",
    kategori: "Kegiatan warga",
    keterangan: "Peserta senam sehat B2SA memenuhi lapangan Balai Desa",
  },
  {
    cocok: "jewfacgrnumd0ctibrgo",
    kategori: "Pertanian",
    keterangan: "Ladang jagung siap panen di musim kemarau",
  },
  {
    cocok: "jmootgi5mycpjacm5wmz",
    kategori: "Pertanian",
    keterangan: "Hamparan tanaman jagung mengering menjelang panen",
  },
  {
    cocok: "w7rl3gjnso1mi0ry9aov",
    kategori: "Pembangunan",
    keterangan: "Jalan desa beraspal dengan lampu penerangan jalan",
  },
  {
    cocok: "ny2gjdwkoyctrnzggix5",
    kategori: "Pembangunan",
    keterangan: "Jalan desa berpaving di sisi ladang jagung warga",
  },
  {
    cocok: "vmm1jtgnbtaysvxolz89",
    kategori: "Pemandangan",
    keterangan: "Permukiman warga dengan perbukitan hutan di latar belakang",
  },
  {
    cocok: "pejzwyazxpjj3b8mkvb5",
    kategori: "Pemandangan",
    keterangan: "Rumah-rumah warga di antara kebun dan hutan desa",
  },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const semua = await prisma.galeri.findMany({
    select: { id: true, urlFoto: true, publicId: true, keterangan: true },
  });

  let diubah = 0;
  for (const p of PERBAIKAN) {
    // publicId kadang kosong pada unggahan lama, jadi urlFoto ikut dicocokkan.
    const foto = semua.find(
      (g) => g.publicId?.includes(p.cocok) || g.urlFoto.includes(p.cocok),
    );
    if (!foto) {
      console.log(`  ! tidak ketemu: ${p.cocok}`);
      continue;
    }
    await prisma.galeri.update({
      where: { id: foto.id },
      data: { kategori: p.kategori, keterangan: p.keterangan },
    });
    console.log(`  "${foto.keterangan}" → [${p.kategori}] ${p.keterangan}`);
    diubah++;
  }

  console.log(`Selesai. ${diubah} keterangan diperbarui.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
