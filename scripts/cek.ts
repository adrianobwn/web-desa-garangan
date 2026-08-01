/**
 * Pemeriksaan mandiri untuk logika non-trivial: sanitasi XSS, validasi Zod,
 * dan filter berita publik. Jalankan: npm run cek
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { bersihkanHtml, keTeksPolos } from "../lib/sanitasi";
import {
  agendaSchema,
  beritaQuerySchema,
  kontakSchema,
  pengumumanSchema,
  statistikSchema,
  uploadSchema,
} from "../lib/validasi";
import { filterPublik, whereBerita } from "../lib/queries";
import { slugify, tanggalPanjang, angka, persen } from "../lib/util";

let lulus = 0;
function cek(nama: string, fn: () => void) {
  fn();
  lulus++;
  console.log(`  ✓ ${nama}`);
}

console.log("\nSanitasi HTML (XSS)");
cek("tag <script> dibuang", () => {
  assert.equal(bersihkanHtml("<script>alert(1)</script><p>ok</p>"), "<p>ok</p>");
});
cek("atribut event (onerror/onclick) dibuang", () => {
  assert.ok(!bersihkanHtml('<img src=x onerror="alert(1)">').includes("onerror"));
  assert.equal(bersihkanHtml('<p onclick="x()">t</p>'), "<p>t</p>");
});
cek("skema javascript: pada href dibuang", () => {
  assert.ok(
    !bersihkanHtml('<a href="javascript:alert(1)">k</a>').includes("javascript"),
  );
});
cek("iframe/object dibuang", () => {
  assert.equal(bersihkanHtml('<iframe src="http://jahat.id"></iframe>'), "");
  assert.equal(bersihkanHtml("<object data='x'></object>"), "");
});
cek("tag artikel yang sah dipertahankan", () => {
  const html = "<h2>Judul</h2><p><strong>tebal</strong></p><blockquote>kutipan</blockquote>";
  assert.equal(bersihkanHtml(html), html);
});
cek("tautan keluar diberi rel noopener", () => {
  assert.ok(
    bersihkanHtml('<a href="https://a.id">x</a>').includes("noopener"),
  );
});
cek("keTeksPolos memberi spasi antar blok & memotong", () => {
  assert.equal(keTeksPolos("<h2>Judul</h2><p>Isi teks.</p>"), "Judul Isi teks.");
  assert.ok(keTeksPolos("<p>" + "a".repeat(300) + "</p>").length <= 160);
});

console.log("\nValidasi Zod");
cek("kontak menolak nomor WA tidak valid", () => {
  const r = kontakSchema.safeParse({
    nama: "Budi Santoso",
    whatsapp: "bukan-nomor",
    pesan: "Halo pemerintah desa, saya ingin bertanya.",
  });
  assert.equal(r.success, false);
});
cek("kontak menerima format 08/62/+62", () => {
  for (const wa of ["081234567890", "6281234567890", "+6281234567890"]) {
    const r = kontakSchema.safeParse({
      nama: "Budi Santoso",
      whatsapp: wa,
      pesan: "Halo pemerintah desa, saya ingin bertanya.",
    });
    assert.equal(r.success, true, `${wa} seharusnya valid`);
  }
});
cek("upload menolak MIME & ukuran di luar batas", () => {
  assert.equal(
    uploadSchema.safeParse({ type: "application/pdf", size: 1000 }).success,
    false,
  );
  assert.equal(
    uploadSchema.safeParse({ type: "image/png", size: 11 * 1024 * 1024 }).success,
    false,
  );
  assert.equal(
    uploadSchema.safeParse({ type: "image/png", size: 500_000 }).success,
    true,
  );
});
cek("upload menerima HEIC (foto iPhone), termasuk type kosong", () => {
  // Regresi: dulu hanya JPG/PNG/WebP, sehingga foto bawaan iPhone selalu
  // ditolak. Sebagian browser juga mengirim type kosong untuk HEIC.
  for (const type of ["image/heic", "image/heif", ""]) {
    assert.equal(
      uploadSchema.safeParse({ type, size: 500_000 }).success,
      true,
      `type "${type}" seharusnya diterima`,
    );
  }
  // Isi berkas tetap diperiksa magic bytes di lib/cloudinary.ts, jadi type
  // kosong bukan berarti sembarang berkas bisa lolos.
  assert.equal(uploadSchema.safeParse({ type: "image/gif", size: 100 }).success, false);
});
cek("query berita: nilai aneh ditolak, default terpasang", () => {
  assert.equal(beritaQuerySchema.safeParse({ bulan: "juli" }).success, false);
  assert.equal(beritaQuerySchema.parse({}).page, 1);
  // perPage dibatasi agar tidak bisa menarik seluruh tabel.
  assert.equal(beritaQuerySchema.safeParse({ perPage: 9999 }).success, false);
});
cek("statistik menolak persentase > 100", () => {
  const r = statistikSchema.safeParse({
    totalPenduduk: 100,
    jumlahKk: 30,
    lakiLaki: 50,
    perempuan: 50,
    pendidikan: [{ label: "SD", nilai: 150 }],
  });
  assert.equal(r.success, false);
});

console.log("\nFilter query berita");
cek("filter publik hanya TERBIT dan tanggal <= sekarang", () => {
  const w = whereBerita({ publik: true });
  assert.equal(w.status, "TERBIT");
  assert.ok((w.tanggalTerbit as { lte: Date }).lte instanceof Date);
});
cek("admin tanpa status melihat draf juga", () => {
  assert.equal(whereBerita({}).status, undefined);
});
cek("batas waktu terbit dihitung ulang tiap panggilan (bukan beku saat impor)", () => {
  // Regresi: dulu `filterPublik` adalah objek konstan, sehingga `new Date()`
  // membeku di waktu server start dan berita baru tidak pernah muncul.
  const a = (filterPublik().tanggalTerbit as { lte: Date }).lte.getTime();
  const sekarang = Date.now();
  assert.ok(Math.abs(sekarang - a) < 1000, "batas waktu harus mengikuti waktu kini");
  assert.equal(typeof filterPublik, "function");
});
cek("pencarian mencakup judul & ringkasan, case-insensitive", () => {
  const w = whereBerita({ q: "posyandu", publik: true });
  assert.equal(w.OR?.length, 2);
});
cek("filter bulan menghasilkan rentang satu bulan penuh", () => {
  const w = whereBerita({ bulan: "2026-02" });
  const r = w.tanggalTerbit as { gte: Date; lt: Date };
  assert.equal(r.gte.getMonth(), 1);
  assert.equal(r.lt.getMonth(), 2);
});

console.log("\nUtilitas");
cek("slugify aman untuk URL", () => {
  assert.equal(slugify("Panen Raya Jagung 8,2 Ton/Ha!"), "panen-raya-jagung-82-tonha");
  assert.ok(slugify("a".repeat(200)).length <= 80);
});
cek("format tanggal & angka Indonesia", () => {
  assert.equal(tanggalPanjang(new Date("2026-07-24T00:00:00")), "24 Juli 2026");
  assert.equal(angka(4212), "4.212");
});

console.log("\nForm agenda & pengumuman (admin)");
cek("agenda: kolom opsional kosong tidak menggagalkan simpan", () => {
  const r = agendaSchema.safeParse({
    judul: "Rapat koordinasi RT",
    tanggal: "2026-08-20",
    waktu: "",
    lokasi: "",
    deskripsi: "",
    rutin: false,
  });
  assert.equal(r.success, true, JSON.stringify(r.error?.issues));
  // "" harus jadi null, bukan string kosong yang tersimpan di database.
  assert.equal(r.data?.waktu, null);
  assert.equal(r.data?.lokasi, null);
});
cek("agenda: tanggal kosong memberi pesan Indonesia yang jelas", () => {
  // Regresi: z.coerce.date() dulu mengubah "" jadi Invalid Date dan
  // memunculkan "expected date, received Date" yang membingungkan admin.
  const r = agendaSchema.safeParse({ judul: "Rapat desa", tanggal: "" });
  assert.equal(r.success, false);
  const pesan = r.error!.issues.map((i) => i.message).join(" ");
  assert.ok(pesan.includes("Tanggal wajib diisi"), pesan);
  assert.ok(!pesan.includes("received Date"), "pesan teknis tidak boleh bocor");
});
cek("agenda & pengumuman: pesan validasi berbahasa Indonesia", () => {
  const a = agendaSchema.safeParse({ judul: "ab", tanggal: "2026-08-20" });
  assert.ok(
    a.error!.issues[0].message.includes("minimal 3 karakter"),
    a.error!.issues[0].message,
  );
  const p = pengumumanSchema.safeParse({ judul: "Judul oke", isi: "pendek" });
  assert.ok(
    p.error!.issues[0].message.includes("minimal 10 karakter"),
    p.error!.issues[0].message,
  );
});

console.log("\nHoneypot form kontak");
cek("field honeypot tidak menghasilkan pesan error yang membocorkan namanya", () => {
  const r = kontakSchema.safeParse({
    nama: "Bot Spam",
    whatsapp: "081234567891",
    pesan: "Pesan spam otomatis dari bot jahat.",
    website: "http://spam.id",
  });
  // Harus lolos validasi; penolakan terjadi diam-diam di Route Handler.
  assert.equal(r.success, true);
  assert.equal(r.data?.website, "http://spam.id");
});


console.log("\nFormat angka Indonesia");
cek("persen memakai koma desimal, bukan titik", () => {
  assert.equal(persen(21.5), "21,5%");
  assert.equal(persen(34.1), "34,1%");
  assert.equal(persen(1), "1%");
});
console.log(`\n${lulus} pemeriksaan lulus.\n`);
