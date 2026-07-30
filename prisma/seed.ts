import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Isi awal: mengikuti konten contoh di file desain. Angka & narasi masih
// placeholder sampai divalidasi sekretaris desa (lihat README handoff).
const KATEGORI = [
  "Pemerintahan",
  "Pembangunan",
  "Pertanian",
  "Kesehatan",
  "Pendidikan",
  "UMKM",
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin.garangan";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "GarnganDesa#2026";

  const admin = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      nama: "Admin Sekretariat",
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });

  for (const nama of KATEGORI) {
    await prisma.kategori.upsert({
      where: { slug: slugify(nama) },
      update: {},
      create: { nama, slug: slugify(nama) },
    });
  }
  const kategori = Object.fromEntries(
    (await prisma.kategori.findMany()).map((k) => [k.nama, k.id]),
  );

  const berita = [
    {
      judul:
        "Panen raya jagung hibrida di Dusun Garangan capai 8,2 ton per hektar, tertinggi lima tahun",
      ringkasan:
        "Kelompok Tani Sido Makmur mencatat hasil tertinggi sejak 2021 berkat benih unggul dan irigasi tetes.",
      kategori: "Pertanian",
      tanggal: "2026-07-24",
      dibaca: 312,
      tags: ["jagung", "dana desa", "kelompok tani", "irigasi"],
      isi: `<p><strong>GARANGAN</strong> — Kelompok Tani Sido Makmur di Dusun Garangan mencatat hasil panen jagung hibrida sebesar 8,2 ton pipilan kering per hektar pada musim tanam kedua tahun ini. Angka tersebut menjadi capaian tertinggi dalam lima tahun terakhir, naik dari rata-rata 6,4 ton per hektar pada 2025.</p>
<p>Ketua kelompok tani, Sunarto, mengatakan kenaikan hasil didorong oleh penggunaan benih hibrida bersertifikat dan penerapan irigasi tetes sederhana yang dibiayai Dana Desa 2026 sebesar Rp84 juta.</p>
<blockquote>“Dulu musim kedua sering gagal karena kekurangan air. Sekarang irigasi tetes membuat tanaman bertahan sampai panen.”</blockquote>
<h2>Diserap penggilingan lokal</h2>
<p>Sebagian besar hasil panen diserap dua penggilingan pakan di wilayah Wonosamodro dengan harga Rp4.900 per kilogram, di atas harga rata-rata pengepul. Pemerintah desa memfasilitasi kontrak sederhana antara kelompok tani dan pembeli agar harga tidak jatuh saat panen serentak.</p>
<p>Kepala Desa Garangan menyampaikan bahwa demplot serupa akan diperluas ke Dusun Losari dan Dusun Ngasinan pada musim tanam berikutnya, dengan target tambahan 12 hektar lahan.</p>`,
    },
    {
      judul: "Posyandu Melati raih penghargaan tingkat kecamatan",
      ringkasan:
        "Angka stunting desa turun ke 7,8 persen, terendah se-Kecamatan Wonosamodro.",
      kategori: "Kesehatan",
      tanggal: "2026-07-21",
      dibaca: 198,
      tags: ["posyandu", "stunting"],
      isi: `<p>Posyandu Melati Dusun Garangan menerima penghargaan posyandu terbaik tingkat Kecamatan Wonosamodro tahun 2026. Penilaian mencakup kelengkapan administrasi, keaktifan kader, dan capaian penurunan stunting.</p><p>Angka stunting Desa Garangan tercatat 7,8 persen, terendah di antara desa se-kecamatan.</p>`,
    },
    {
      judul: "Talud Kali Serang tahap II dimulai Agustus",
      ringkasan:
        "Dana Desa 2026 dialokasikan Rp312 juta untuk pengendalian banjir musiman.",
      kategori: "Pembangunan",
      tanggal: "2026-07-18",
      dibaca: 176,
      tags: ["dana desa", "infrastruktur"],
      isi: `<p>Pembangunan talud Kali Serang tahap II akan dimulai awal Agustus 2026 dengan alokasi Dana Desa sebesar Rp312 juta. Pekerjaan meliputi 180 meter tanggul di sisi timur aliran sungai.</p>`,
    },
    {
      judul: "Musdes penyusunan RKPDes 2027 sepakati tiga prioritas",
      ringkasan:
        "Jalan usaha tani, air bersih, dan pemberdayaan pemuda jadi fokus anggaran tahun depan.",
      kategori: "Pemerintahan",
      tanggal: "2026-07-15",
      dibaca: 254,
      tags: ["rkpdes", "musdes"],
      isi: `<p>Musyawarah desa penyusunan RKPDes 2027 menyepakati tiga prioritas pembangunan: jalan usaha tani, perluasan jaringan air bersih, dan program pemberdayaan pemuda.</p>`,
    },
    {
      judul: "30 pelaku usaha ikuti pelatihan pemasaran digital",
      ringkasan:
        "Pelatihan difokuskan pada foto produk dan penjualan lewat marketplace.",
      kategori: "UMKM",
      tanggal: "2026-07-11",
      dibaca: 143,
      tags: ["umkm", "pelatihan"],
      isi: `<p>Sebanyak 30 pelaku usaha rumahan mengikuti pelatihan pemasaran digital di balai desa. Materi mencakup pemotretan produk, penetapan harga, dan pembukaan toko di marketplace.</p>`,
    },
    {
      judul: "Gedung PAUD Tunas Harapan selesai direnovasi",
      ringkasan: "Renovasi mencakup atap, lantai, dan sanitasi ramah anak.",
      kategori: "Pendidikan",
      tanggal: "2026-07-08",
      dibaca: 121,
      tags: ["paud", "pendidikan"],
      isi: `<p>Renovasi gedung PAUD Tunas Harapan rampung dan mulai digunakan pada tahun ajaran baru. Pekerjaan mencakup penggantian atap, pengerasan lantai, dan pembangunan sanitasi ramah anak.</p>`,
    },
    {
      judul: "Vaksinasi PMK gratis untuk 240 ekor sapi warga",
      ringkasan:
        "Program dinas peternakan menyasar seluruh kandang komunal di lima dusun.",
      kategori: "Pertanian",
      tanggal: "2026-07-04",
      dibaca: 167,
      tags: ["ternak", "pmk"],
      isi: `<p>Dinas Peternakan Kabupaten Boyolali menggelar vaksinasi penyakit mulut dan kuku (PMK) gratis untuk 240 ekor sapi milik warga Desa Garangan.</p>`,
    },
    {
      judul: "Rekap kegiatan HUT RI ke-81",
      ringkasan: "Draf laporan kegiatan peringatan kemerdekaan tingkat desa.",
      kategori: "Pemerintahan",
      tanggal: null,
      dibaca: 0,
      tags: ["hut ri"],
      isi: `<p>Draf rekap kegiatan — menunggu dokumentasi panitia.</p>`,
    },
  ];

  for (const b of berita) {
    await prisma.berita.upsert({
      where: { slug: slugify(b.judul) },
      update: {},
      create: {
        slug: slugify(b.judul),
        judul: b.judul,
        ringkasan: b.ringkasan,
        isi: b.isi,
        status: b.tanggal ? "TERBIT" : "DRAF",
        tanggalTerbit: b.tanggal ? new Date(b.tanggal) : null,
        dibaca: b.dibaca,
        tags: b.tags,
        kategoriId: kategori[b.kategori],
        penulisId: admin.id,
      },
    });
  }

  await prisma.agenda.deleteMany();
  await prisma.agenda.createMany({
    data: [
      {
        judul: "Bersih desa & merti dusun",
        tanggal: new Date("2026-08-09"),
        waktu: "07.00 WIB",
        lokasi: "Lapangan Dusun Garangan",
        deskripsi: "Seluruh warga",
      },
      {
        judul: "Upacara HUT RI ke-81 & karnaval desa",
        tanggal: new Date("2026-08-17"),
        waktu: "08.00 WIB",
        lokasi: "Halaman Balai Desa",
        deskripsi: "Lomba antar-RT sore hari",
      },
      {
        judul: "Kerja bakti Karang Taruna",
        tanggal: new Date("2026-08-23"),
        waktu: "07.00 WIB",
        lokasi: "Lingkungan Dusun Losari",
        rutin: true,
      },
      {
        judul: "Posyandu balita",
        tanggal: new Date("2026-08-05"),
        waktu: "08.00 WIB",
        lokasi: "Tiap dusun",
        rutin: true,
      },
      {
        judul: "Yasinan rutin",
        tanggal: new Date("2026-08-06"),
        waktu: "Ba'da Isya",
        lokasi: "Bergilir antar-rumah",
        rutin: true,
      },
    ],
  });

  await prisma.pengumuman.deleteMany();
  await prisma.pengumuman.createMany({
    data: [
      {
        judul:
          "Pendaftaran BLT Dana Desa tahap III dibuka 1–14 Agustus 2026",
        isi: "Syarat: KTP, KK, dan surat keterangan tidak mampu dari RT. Pendaftaran di kantor desa pada jam kerja, tanpa biaya.",
        kategori: "Pemerintahan",
        disematkan: true,
        tanggal: new Date("2026-07-26"),
      },
      {
        judul: "Jadwal posyandu balita bulan Agustus di lima dusun",
        isi: "Posyandu dilaksanakan pada awal bulan di masing-masing dusun.",
        kategori: "Kesehatan",
        tanggal: new Date("2026-07-25"),
      },
      {
        judul: "Pemadaman listrik terjadwal, Rabu 30 Juli 09.00–13.00",
        isi: "Pemeliharaan jaringan PLN meliputi Dusun Garangan dan Losari.",
        kategori: "Umum",
        tanggal: new Date("2026-07-23"),
      },
      {
        judul: "Musyawarah dusun penyusunan RKPDes 2027",
        isi: "Musdus digelar bergilir di lima dusun sepanjang Juli–Agustus.",
        kategori: "Pemerintahan",
        tanggal: new Date("2026-07-19"),
      },
      {
        judul: "Penyaluran bantuan bibit jagung musim tanam II",
        isi: "Bibit diambil di kantor desa dengan menunjukkan kartu tani.",
        kategori: "Pertanian",
        tanggal: new Date("2026-07-12"),
      },
    ],
  });

  await prisma.statistik.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      totalPenduduk: 4212,
      jumlahKk: 1386,
      lakiLaki: 2118,
      perempuan: 2094,
      luasWilayahHa: 527,
      perDusun: [
        { label: "Dusun I — Garangan", jiwa: 1253, kk: 412 },
        { label: "Dusun II — Losari", jiwa: 965, kk: 318 },
        { label: "Dusun III — Sokokerep", jiwa: 532, kk: 176 },
        { label: "Dusun IV — Getas Krikil", jiwa: 718, kk: 236 },
        { label: "Dusun V — Ngasinan", jiwa: 744, kk: 244 },
      ],
      mataPencaharian: [
        { label: "Petani & buruh tani", nilai: 61 },
        { label: "Wiraswasta / pedagang", nilai: 17 },
        { label: "Buruh / karyawan swasta", nilai: 12 },
        { label: "PNS / TNI / Polri", nilai: 3 },
        { label: "Lainnya / belum bekerja", nilai: 7 },
      ],
      pendidikan: [
        { label: "Tidak/belum sekolah", nilai: 14 },
        { label: "SD / sederajat", nilai: 32 },
        { label: "SMP / sederajat", nilai: 20 },
        { label: "SMA / sederajat", nilai: 27 },
        { label: "Diploma / Sarjana", nilai: 7 },
      ],
      kelompokUsia: [
        { label: "0–14 tahun", nilai: 23, jumlah: 988 },
        { label: "15–34 tahun", nilai: 31, jumlah: 1312 },
        { label: "35–54 tahun", nilai: 28, jumlah: 1176 },
        { label: "55–64 tahun", nilai: 10, jumlah: 412 },
        { label: "65+ tahun", nilai: 8, jumlah: 324 },
      ],
    },
  });

  await prisma.wilayah.deleteMany();
  await prisma.wilayah.createMany({
    data: [
      {
        nama: "Dusun I — Garangan",
        namaKadus: null,
        jumlahRt: 5,
        jumlahRw: 1,
        kelembagaan: "PKK, Karang Taruna IRMASGA & Keong Jaya",
        urutan: 1,
      },
      {
        nama: "Dusun II — Losari",
        namaKadus: "Kamsudin",
        jumlahRt: 4,
        kelembagaan: "PKK, 3 Karang Taruna",
        urutan: 2,
      },
      {
        nama: "Dusun III — Sokokerep",
        namaKadus: "Handogo",
        jumlahRt: 2,
        kelembagaan: "PKK, Karang Taruna",
        urutan: 3,
      },
      {
        nama: "Dusun IV — Getas Krikil",
        namaKadus: "Ngatiri",
        urutan: 4,
      },
      {
        nama: "Dusun V — Ngasinan",
        namaKadus: "Dartono",
        jumlahRt: 4,
        kelembagaan: "Karang Taruna & PKK tiap RT",
        urutan: 5,
      },
    ],
  });

  await prisma.perangkatDesa.deleteMany();
  await prisma.perangkatDesa.createMany({
    data: [
      { nama: "Jamroji", jabatan: "Kepala Desa", tingkat: 0, urutan: 0 },
      { nama: "Nurkolis", jabatan: "Sekretaris Desa", tingkat: 1, urutan: 0 },
      {
        nama: "Muk Baker",
        jabatan: "Kasi Pemerintahan & Pelayanan",
        tingkat: 2,
        urutan: 0,
      },
      { nama: "Muh Amin", jabatan: "Kasi Kesra", tingkat: 2, urutan: 1 },
      { nama: "Edi Kurniawan", jabatan: "Kaur Keuangan", tingkat: 2, urutan: 2 },
      {
        nama: "Gi Bandung Gandi P",
        jabatan: "Kaur Perencanaan",
        tingkat: 2,
        urutan: 3,
      },
      { nama: "— (konfirmasi)", jabatan: "Kadus I · Garangan", tingkat: 3, urutan: 0 },
      { nama: "Kamsudin", jabatan: "Kadus II · Losari", tingkat: 3, urutan: 1 },
      { nama: "Handogo", jabatan: "Kadus III · Sokokerep", tingkat: 3, urutan: 2 },
      { nama: "Ngatiri", jabatan: "Kadus IV · Getas Krikil", tingkat: 3, urutan: 3 },
      { nama: "Dartono", jabatan: "Kadus V · Ngasinan", tingkat: 3, urutan: 4 },
      { nama: "Agung Nugroho", jabatan: "Staf", tingkat: 4, urutan: 0 },
    ],
  });

  // Galeri contoh memakai placeholder abu-abu; ganti dengan unggahan asli.
  await prisma.galeri.deleteMany();
  await prisma.galeri.createMany({
    data: [
      { urlFoto: "", kategori: "Kegiatan warga", keterangan: "HUT RI ke-81 & karnaval desa" },
      { urlFoto: "", kategori: "Kegiatan warga", keterangan: "Kerja bakti Karang Taruna Losari" },
      { urlFoto: "", kategori: "Kegiatan warga", keterangan: "Posyandu balita Dusun Garangan" },
      { urlFoto: "", kategori: "Pertanian", keterangan: "Panen jagung Kelompok Tani Sido Makmur" },
      { urlFoto: "", kategori: "Kegiatan warga", keterangan: "Yasinan rutin malam Jumat" },
      { urlFoto: "", kategori: "Perangkat desa", keterangan: "Rapat perangkat desa" },
      { urlFoto: "", kategori: "Pembangunan", keterangan: "Pembangunan talud Kali Garangan" },
      { urlFoto: "", kategori: "Pemerintahan", keterangan: "Musyawarah dusun RKPDes" },
      { urlFoto: "", kategori: "Pemandangan", keterangan: "Hamparan sawah tadah hujan Garangan" },
      { urlFoto: "", kategori: "Pertanian", keterangan: "Vaksinasi ternak sapi warga" },
    ],
  });

  console.log(`Seed selesai. Admin: ${username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
