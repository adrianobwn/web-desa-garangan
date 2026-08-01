import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7: URL koneksi tinggal di sini, bukan di schema.prisma.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // env() melempar error saat variabel belum ada, padahal `prisma generate`
    // sebenarnya tidak memerlukan koneksi. Nilai kosong dipakai sebagai
    // cadangan agar generate tetap jalan; perintah yang benar-benar
    // menghubungi basis data tetap gagal bila URL-nya tidak diisi.
    url: process.env.DATABASE_URL ? env("DATABASE_URL") : "",
  },
});
