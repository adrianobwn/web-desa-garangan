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
    // Migrasi memerlukan advisory lock, dan lock itu tidak tersedia lewat
    // koneksi pooled (PgBouncer) sehingga `migrate deploy` timeout dengan
    // galat P1002. Karena itu migrasi memakai DIRECT_URL bila tersedia;
    // aplikasi tetap memakai DATABASE_URL yang pooled.
    //
    // env() melempar galat saat variabel belum ada, padahal `prisma generate`
    // tidak memerlukan koneksi. Nilai kosong dipakai sebagai cadangan agar
    // generate tetap jalan; perintah yang benar-benar menghubungi basis data
    // tetap berhenti dengan pesan jelas bila URL-nya tidak diisi.
    url: process.env.DIRECT_URL
      ? env("DIRECT_URL")
      : process.env.DATABASE_URL
        ? env("DATABASE_URL")
        : "",
  },
});
