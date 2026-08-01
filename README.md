<div align="center">

<img src="public/lambang-boyolali.svg" alt="Lambang Kabupaten Boyolali" width="96">

# Website Resmi Desa Garangan

**Portal informasi Desa Garangan, Kecamatan Wonosamodro, Kabupaten Boyolali**
— berita, profil desa, agenda & pengumuman, statistik penduduk, galeri, dan
form kontak, lengkap dengan panel admin untuk perangkat desa.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-EB5424?logo=auth0&logoColor=white)](https://authjs.dev)

</div>

---

## Daftar isi

| | |
|---|---|
| [1. Menjalankan di komputer sendiri](#1-menjalankan-di-komputer-sendiri) | Instalasi, `.env`, daftar perintah |
| [2. Struktur proyek](#2-struktur-proyek) | Peta folder |
| [3. Cara memakai panel admin](#3-cara-memakai-panel-admin) | Panduan untuk perangkat desa |
| [4. Deploy ke produksi](#4-deploy-ke-produksi) | Vercel atau VPS sendiri |
| [5. Backup database](#5-backup-database) | Jadwal cron & uji pemulihan |
| [6. Keamanan](#6-keamanan--yang-sudah-terpasang) | Yang sudah terpasang |
| [7. Yang masih perlu dilengkapi](#7-yang-masih-perlu-dilengkapi-sebelum-go-live) | Checklist sebelum go-live |
| [8. Catatan teknis](#8-catatan-teknis) | Keputusan desain & jebakan |

---

## Fitur

**Halaman publik**

- **Beranda** — ringkasan berita terbaru, agenda mendatang, pengumuman tersemat
- **Berita** — pencarian, filter per bulan, paginasi, penghitung dibaca, tombol bagikan
- **Profil desa** — sejarah, visi-misi, bagan struktur pemerintahan, peta lokasi
- **Agenda & pengumuman** — jadwal kegiatan desa, termasuk agenda rutin
- **Statistik penduduk** — jumlah penduduk, KK, sebaran pendidikan & pekerjaan
- **Galeri** — dokumentasi kegiatan desa
- **Kontak** — form pesan ke pemerintah desa, dengan proteksi spam

**Panel admin** (`/admin`)

- Tulis & kelola berita — draf, jadwal terbit, editor dengan toolbar
- Kelola agenda, pengumuman, galeri (unggah massal seret & lepas), dan statistik
- Pesan masuk dari form kontak, dengan tombol balas via WhatsApp
- Log aktivitas — catatan siapa mengubah apa dan kapan

**Teknis**

- Next.js 16 App Router · React 19 · TypeScript · PostgreSQL + Prisma 7
- Auth.js v5 (bcrypt + sesi JWT httpOnly), rate-limit login
- Validasi Zod di setiap Route Handler, sanitasi HTML anti-XSS
- Unggah gambar ke Cloudinary dengan cek MIME, ukuran, dan magic bytes
- SEO: `sitemap.xml`, `robots.txt`, metadata Open Graph
- Antarmuka sepenuhnya berbahasa Indonesia

---

## 1. Menjalankan di komputer sendiri

Butuh **Node.js 20+** dan **PostgreSQL 14+**.

```bash
npm install
createdb desa_garangan             # buat database kosong
cp .env.example .env               # lalu isi (lihat tabel di bawah)
npx prisma migrate deploy          # buat tabel
npm run db:seed                    # isi data awal + akun admin
npm run dev                        # buka http://localhost:3000
```

Panel admin: <http://localhost:3000/admin/login>

Akun admin dibuat oleh `npm run db:seed`. Tentukan sendiri kredensialnya
lewat `.env` **sebelum** menjalankan seed:

```
SEED_ADMIN_USERNAME="..."
SEED_ADMIN_PASSWORD="..."
```

Kalau kedua variabel itu tidak diisi, seed memakai nilai bawaan di
`prisma/seed.ts`. **Jangan pakai nilai bawaan untuk situs yang dipakai
publik.** Cara mengganti kata sandi ada di bagian 6.

### Isi berkas `.env`

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ya | `postgresql://user:sandi@host:5432/desa_garangan` |
| `AUTH_SECRET` | ya | Kunci sesi. Buat dengan `npx auth secret` |
| `NEXT_PUBLIC_SITE_URL` | ya | Alamat situs, mis. `https://desagarangan.id` |
| `CLOUDINARY_CLOUD_NAME` | untuk unggah foto | dari dashboard Cloudinary |
| `CLOUDINARY_API_KEY` | untuk unggah foto | dari dashboard Cloudinary |
| `CLOUDINARY_API_SECRET` | untuk unggah foto | **rahasia**, jangan dibagikan |

`.env` **tidak pernah** ikut ter-commit (sudah masuk `.gitignore`). Yang
di-commit hanya `.env.example` sebagai contoh tanpa isi rahasia.

Tanpa kredensial Cloudinary situs tetap jalan — hanya fitur unggah gambar yang
menolak dengan pesan "Penyimpanan gambar belum dikonfigurasi".

### Perintah yang tersedia

```bash
npm run dev          # mode pengembangan
npm run build        # bangun untuk produksi
npm run start        # jalankan hasil build
npm run cek          # pemeriksaan mandiri (sanitasi, validasi, filter)
npm run db:seed      # isi ulang data contoh
npm run db:migrate   # terapkan migrasi (produksi)
```

---

## 2. Struktur proyek

```
app/
  (publik)/          beranda, berita, profil, agenda, statistik, galeri
  admin/
    login/           halaman masuk (di luar layout panel)
    (panel)/         dashboard, berita, agenda, galeri, statistik, pesan, audit
  api/               Route Handler terpisah per resource
components/
  publik/  admin/    komponen tampilan
lib/
  prisma.ts          koneksi database
  validasi.ts        semua skema Zod
  sanitasi.ts        pembersih HTML (anti-XSS)
  api.ts             error handling terpusat, cek sesi, audit log
  cloudinary.ts      unggah + validasi berkas
  queries.ts         query & paginasi
prisma/schema.prisma model data
scripts/
  cek.ts             pemeriksaan mandiri
  backup.sh          backup database
```

---

## 3. Cara memakai panel admin

| Menu | Fungsi |
|---|---|
| **Ringkasan** | angka ringkas + daftar yang perlu ditindaklanjuti |
| **Berita** | tulis, ubah, hapus; simpan sebagai draf atau terbitkan |
| **Agenda & Pengumuman** | jadwal kegiatan dan pemberitahuan (bisa disematkan) |
| **Galeri** | unggah banyak foto sekaligus (seret & lepas), hapus foto |
| **Statistik penduduk** | ubah angka; halaman publik ikut berubah otomatis |
| **Pesan masuk** | pesan dari form kontak, tombol balas via WhatsApp |
| **Log aktivitas** | catatan siapa mengubah apa dan kapan |

Catatan penting:

- **Draf tidak terlihat publik.** Berita baru muncul setelah statusnya
  *Terbit* dan tanggal terbitnya sudah lewat.
- **Statistik hanya diisi di satu tempat.** Halaman publik membaca angka yang
  sama, jadi tidak ada risiko dua data berbeda.
- Isi berita otomatis dibersihkan dari kode berbahaya sebelum disimpan.

---

## 4. Deploy ke produksi

### Vercel (paling sederhana)

1. Push repositori ke GitHub.
2. Di Vercel: **New Project** → pilih repo.
3. Isi semua variabel `.env` di **Settings → Environment Variables**.
   `NEXT_PUBLIC_SITE_URL` diisi domain asli (`https://…`).
4. Deploy. Setelah selesai, jalankan sekali dari komputer:
   ```bash
   DATABASE_URL="<url-produksi>" npx prisma migrate deploy
   DATABASE_URL="<url-produksi>" npm run db:seed
   ```
   Database bisa memakai Neon / Supabase / Vercel Postgres.

### VPS sendiri

```bash
npm ci && npm run build
npx prisma migrate deploy
npm run start          # jalankan lewat systemd atau pm2
```

Letakkan Nginx/Caddy di depannya untuk **HTTPS** (wajib — sesi login
mengandalkan cookie `Secure`).

---

## 5. Backup database

Skrip `scripts/backup.sh` membuat `.sql.gz`, memverifikasi hasilnya tidak
kosong/rusak, dan menghapus arsip lebih tua dari 30 hari.

```bash
crontab -e
# backup tiap hari pukul 02.00
0 2 * * * /path/ke/web-desa-garangan/scripts/backup.sh >> /var/log/backup-desa.log 2>&1
```

Atur lokasi & masa simpan lewat `BACKUP_DIR` dan `BACKUP_KEEP_DAYS`.

**Uji pemulihan minimal sekali** — backup yang belum pernah dipulihkan belum
tentu bisa dipakai:

```bash
createdb desa_uji
gunzip -c /var/backups/desa-garangan/desa-garangan-XXXX.sql.gz | psql -d desa_uji
psql -d desa_uji -c 'SELECT count(*) FROM "Berita";'
dropdb desa_uji
```

Salin juga arsipnya ke luar server (harddisk kantor desa / cloud storage).
Backup yang hanya ada di server yang sama akan ikut hilang bila server rusak.

---

## 6. Keamanan — yang sudah terpasang

| Aspek | Penerapan |
|---|---|
| Kata sandi | hash **bcrypt** (12 putaran), tidak pernah disimpan polos |
| Sesi | JWT di cookie **httpOnly**, `Secure` otomatis di HTTPS, berlaku 8 jam |
| Proteksi `/admin/*` | `proxy.ts` + pemeriksaan ulang di layout dan tiap Route Handler |
| Rate-limit login | 5 percobaan gagal / 15 menit per (username + IP) |
| Validasi input | **Zod** di setiap Route Handler — input klien tidak pernah dipercaya |
| SQL injection | seluruh query lewat **Prisma** (parameterisasi otomatis) |
| XSS | isi berita dibersihkan **sanitize-html** saat *disimpan*, bukan saat tampil |
| Unggah berkas | cek MIME + ukuran (maks 10MB) + **magic bytes** isi berkas |
| Security header | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS |
| Audit log | tabel `AuditLog` — aksi, entitas, pengguna, IP, waktu |
| Spam form kontak | honeypot + rate-limit 3 pesan / 10 menit per IP |
| Panel admin | `X-Robots-Tag: noindex` + diblokir di `robots.txt` |

### Mengganti kata sandi / menambah admin

Belum ada UI khusus. Gunakan Prisma Studio:

```bash
npx prisma studio        # buka tabel User
```

Isi kolom `passwordHash` dengan hasil:

```bash
node -e "console.log(require('bcryptjs').hashSync('sandi-baru-yang-panjang', 12))"
```

---

## 7. Yang masih perlu dilengkapi sebelum go-live

Daftar pertanyaan lengkap untuk sekretaris desa ada di
[`PERTANYAAN-SEKDES.md`](PERTANYAAN-SEKDES.md).

**Masih kurang:**

- [ ] Naskah resmi sambutan Kepala Desa, sejarah desa, & visi-misi (RPJMDes)
      — saklarnya di `app/(publik)/profil/page.tsx` (`NASKAH_RESMI`); ubah
      ke `true` per bagian setelah naskah resmi masuk, penanda "contoh"
      hilang sendiri
- [ ] Kontak desa: telepon, surel, nomor Linmas (`KONTAK` di
      `app/(publik)/page.tsx`) — sekarang tampil "Belum tersedia"
- [ ] Batas wilayah desa (utara/selatan/timur/barat)
- [ ] Nama Kepala Dusun I (Garangan) — jabatannya tetap tampil, namanya kosong
- [ ] Jumlah RT Dusun IV Getas Krikil
- [ ] Foto: Kepala Desa & perangkat desa, dokumentasi kegiatan untuk galeri
- [ ] Gambar sampul berita
- [ ] Nama domain (`NEXT_PUBLIC_SITE_URL` masih `localhost:3000`)
- [ ] Kredensial Cloudinary (tanpa ini panel admin tidak bisa unggah gambar)
- [ ] Ganti kata sandi admin bawaan seed

**Sudah beres:** statistik memakai data asli FORM 1 pendataan (3.848 jiwa /
1.224 KK), koordinat peta Balai Desa presisi, lambang Boyolali versi SVG
(izin sudah dikonfirmasi), foto Balai Desa terpasang di beranda & galeri.

Data UMKM sengaja dikosongkan — bagian "Potensi unggulan desa" memakai
komoditas pertanian dulu sampai data usaha warga tersedia.

---

## 8. Catatan teknis

- **Halaman publik dirender dinamis** (`force-dynamic`). Trafik satu desa
  kecil dan query Postgres murah, sehingga perubahan admin langsung terlihat
  tanpa risiko halaman basi.
- **`filterPublik` adalah fungsi, bukan konstanta.** Bila `new Date()`
  dievaluasi saat modul dimuat, batas waktu terbit membeku di waktu server
  start dan berita baru tidak akan pernah muncul. Ada pemeriksaan regresi
  untuk ini di `npm run cek`.
- **Next.js 16**: konvensi `middleware.ts` sudah berganti nama jadi `proxy.ts`
  (runtime Node.js, bukan Edge).
- **Prisma 7**: URL database ada di `prisma.config.ts`, bukan di
  `schema.prisma`, dan koneksi memakai driver adapter `@prisma/adapter-pg`.
- Editor berita memakai `contenteditable` sederhana, cukup untuk toolbar di
  desain. Bila nanti perlu tabel atau riwayat undo, ganti ke TipTap —
  sanitasi di server tidak perlu diubah.
- Komentar bertanda `ponytail:` menandai penyederhanaan yang disengaja
  beserta kapan sebaiknya ditingkatkan.

---

<div align="center">

Dibangun sebagai bagian dari program **KKN** untuk Pemerintah Desa Garangan,
Kecamatan Wonosamodro, Kabupaten Boyolali, Jawa Tengah.

</div>
