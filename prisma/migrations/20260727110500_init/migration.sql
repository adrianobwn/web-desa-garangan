-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "StatusBerita" AS ENUM ('DRAF', 'TERBIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Berita" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "status" "StatusBerita" NOT NULL DEFAULT 'DRAF',
    "gambarSampul" TEXT,
    "tanggalTerbit" TIMESTAMP(3),
    "dibaca" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "penulisId" TEXT NOT NULL,

    CONSTRAINT "Berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "waktu" TEXT,
    "lokasi" TEXT,
    "deskripsi" TEXT,
    "rutin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengumuman" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" TEXT,
    "disematkan" BOOLEAN NOT NULL DEFAULT false,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Galeri" (
    "id" TEXT NOT NULL,
    "urlFoto" TEXT NOT NULL,
    "publicId" TEXT,
    "kategori" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "tanggalUnggah" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Galeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistik" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "totalPenduduk" INTEGER NOT NULL,
    "jumlahKk" INTEGER NOT NULL,
    "lakiLaki" INTEGER NOT NULL,
    "perempuan" INTEGER NOT NULL,
    "luasWilayahHa" INTEGER NOT NULL DEFAULT 527,
    "perDusun" JSONB NOT NULL DEFAULT '[]',
    "mataPencaharian" JSONB NOT NULL DEFAULT '[]',
    "pendidikan" JSONB NOT NULL DEFAULT '[]',
    "kelompokUsia" JSONB NOT NULL DEFAULT '[]',
    "agama" JSONB NOT NULL DEFAULT '[]',
    "terakhirDiperbarui" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wilayah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "namaKadus" TEXT,
    "jumlahRt" INTEGER,
    "jumlahRw" INTEGER,
    "kelembagaan" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerangkatDesa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "foto" TEXT,
    "tingkat" INTEGER NOT NULL DEFAULT 0,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PerangkatDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesanKontak" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusDibalas" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PesanKontak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitasId" TEXT,
    "ringkasan" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "kunci" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_nama_key" ON "Kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_slug_key" ON "Kategori"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Berita_slug_key" ON "Berita"("slug");

-- CreateIndex
CREATE INDEX "Berita_status_tanggalTerbit_idx" ON "Berita"("status", "tanggalTerbit");

-- CreateIndex
CREATE INDEX "Berita_kategoriId_status_idx" ON "Berita"("kategoriId", "status");

-- CreateIndex
CREATE INDEX "Agenda_tanggal_idx" ON "Agenda"("tanggal");

-- CreateIndex
CREATE INDEX "Pengumuman_disematkan_tanggal_idx" ON "Pengumuman"("disematkan", "tanggal");

-- CreateIndex
CREATE INDEX "Galeri_kategori_tanggalUnggah_idx" ON "Galeri"("kategori", "tanggalUnggah");

-- CreateIndex
CREATE INDEX "Wilayah_urutan_idx" ON "Wilayah"("urutan");

-- CreateIndex
CREATE INDEX "PerangkatDesa_tingkat_urutan_idx" ON "PerangkatDesa"("tingkat", "urutan");

-- CreateIndex
CREATE INDEX "PesanKontak_statusDibalas_tanggal_idx" ON "PesanKontak"("statusDibalas", "tanggal");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entitas_entitasId_idx" ON "AuditLog"("entitas", "entitasId");

-- CreateIndex
CREATE INDEX "LoginAttempt_kunci_createdAt_idx" ON "LoginAttempt"("kunci", "createdAt");

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
