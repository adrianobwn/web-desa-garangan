import { z } from "zod";

// Skema Zod dipakai server-side di SETIAP Route Handler. Input klien tidak pernah dipercaya.

export const paginasiSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(9),
});

export const beritaQuerySchema = paginasiSchema.extend({
  q: z.string().trim().max(120).optional(),
  kategori: z.string().trim().max(60).optional(),
  status: z.enum(["DRAF", "TERBIT"]).optional(),
  bulan: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM")
    .optional(),
});

export const beritaSchema = z.object({
  judul: z.string().trim().min(8, "Judul minimal 8 karakter").max(200),
  ringkasan: z.string().trim().min(20, "Ringkasan minimal 20 karakter").max(500),
  isi: z.string().trim().min(50, "Isi berita minimal 50 karakter").max(80_000),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
  status: z.enum(["DRAF", "TERBIT"]).default("DRAF"),
  gambarSampul: z.url("URL gambar tidak valid").or(z.literal("")).nullish(),
  tanggalTerbit: z.coerce.date().nullish(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});

/**
 * Kolom teks opsional dari form HTML datang sebagai "" (bukan undefined).
 * Ubah jadi null supaya tidak dianggap isian kosong yang tidak valid.
 */
const teksOpsional = (maks: number) =>
  z
    .string()
    .trim()
    .max(maks)
    .transform((v) => (v === "" ? null : v))
    .nullish();

/**
 * Tanggal dari <input type="date">. z.coerce.date() mengubah "" menjadi
 * Invalid Date dan memunculkan pesan membingungkan
 * ("expected date, received Date"), jadi string kosong ditolak lebih dulu
 * dengan pesan berbahasa Indonesia.
 */
const tanggalWajib = z
  .string()
  // superRefine: berhenti di kesalahan pertama, jadi kolom kosong tidak
  // memunculkan dua pesan sekaligus ("wajib diisi" + "format tidak valid").
  .superRefine((v, ctx) => {
    if (v.trim() === "") {
      ctx.addIssue({ code: "custom", message: "Tanggal wajib diisi" });
      return;
    }
    if (Number.isNaN(Date.parse(v)))
      ctx.addIssue({ code: "custom", message: "Format tanggal tidak valid" });
  })
  .transform((v) => new Date(v));

export const agendaSchema = z.object({
  judul: z
    .string()
    .trim()
    .min(3, "Judul agenda minimal 3 karakter")
    .max(200, "Judul agenda maksimal 200 karakter"),
  tanggal: tanggalWajib,
  waktu: teksOpsional(40),
  lokasi: teksOpsional(160),
  deskripsi: teksOpsional(1000),
  rutin: z.boolean().default(false),
});

export const pengumumanSchema = z.object({
  judul: z
    .string()
    .trim()
    .min(3, "Judul pengumuman minimal 3 karakter")
    .max(200, "Judul pengumuman maksimal 200 karakter"),
  isi: z
    .string()
    .trim()
    .min(10, "Isi pengumuman minimal 10 karakter")
    .max(5000, "Isi pengumuman maksimal 5000 karakter"),
  kategori: teksOpsional(60),
  disematkan: z.boolean().default(false),
  tanggal: z.coerce.date().default(() => new Date()),
});

export const galeriSchema = z.object({
  urlFoto: z.url("URL foto tidak valid"),
  publicId: z.string().trim().max(200).nullish(),
  kategori: z.string().trim().min(1).max(60),
  keterangan: z.string().trim().min(1).max(300),
});

const distribusiSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(80),
      nilai: z.coerce.number().min(0).max(100),
    }),
  )
  .max(20);

export const statistikSchema = z.object({
  totalPenduduk: z.coerce.number().int().min(0).max(1_000_000),
  jumlahKk: z.coerce.number().int().min(0).max(1_000_000),
  lakiLaki: z.coerce.number().int().min(0).max(1_000_000),
  perempuan: z.coerce.number().int().min(0).max(1_000_000),
  luasWilayahHa: z.coerce.number().int().min(0).max(100_000).default(527),
  jumlahBekerja: z.coerce.number().int().min(0).max(1_000_000).default(0),
  perDusun: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        jiwa: z.coerce.number().int().min(0).max(1_000_000),
        kk: z.coerce.number().int().min(0).max(1_000_000),
      }),
    )
    .max(30)
    .default([]),
  mataPencaharian: distribusiSchema.default([]),
  pendidikan: distribusiSchema.default([]),
  kelompokUsia: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        nilai: z.coerce.number().min(0).max(100),
        jumlah: z.coerce.number().int().min(0).max(1_000_000).optional(),
      }),
    )
    .max(20)
    .default([]),
});

export const kontakSchema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(120),
  whatsapp: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor WhatsApp tidak valid"),
  pesan: z.string().trim().min(10, "Pesan minimal 10 karakter").max(2000),
  // Honeypot: bot mengisi field tersembunyi ini, manusia tidak.
  // Tidak divalidasi ketat di sini — kalau ditolak dengan pesan error, bot
  // justru belajar field mana yang harus dikosongkan. Penanganannya di Route
  // Handler: balas sukses palsu lalu buang pesannya.
  website: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(60),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(200),
});

export const MIME_GAMBAR = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAKS_UKURAN_FILE = 10 * 1024 * 1024; // 10MB, sesuai teks dropzone desain

export const uploadSchema = z.object({
  type: z.enum(MIME_GAMBAR, {
    message: "Format harus JPG, PNG, atau WebP",
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(MAKS_UKURAN_FILE, "Ukuran file maksimal 10MB"),
});
