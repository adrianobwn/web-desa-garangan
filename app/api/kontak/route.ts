import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilIp, gagal, handler } from "@/lib/api";
import { kontakSchema } from "@/lib/validasi";

// Rate-limit sederhana per IP untuk form publik: 5 pesan / 10 menit.
const BATAS = 5;
const JENDELA_MS = 10 * 60_000;
const jejak = new Map<string, number[]>();

/** Hanya membaca, tidak mencatat. */
function sudahMelebihiBatas(ip: string) {
  const sekarang = Date.now();
  const riwayat = (jejak.get(ip) ?? []).filter((t) => sekarang - t < JENDELA_MS);
  jejak.set(ip, riwayat);
  return riwayat.length >= BATAS;
}

/** Dicatat hanya setelah pesan benar-benar tersimpan. */
function catatKiriman(ip: string) {
  const riwayat = jejak.get(ip) ?? [];
  riwayat.push(Date.now());
  jejak.set(ip, riwayat);
  // ponytail: Map in-memory, hilang saat restart & tidak lintas-instance.
  // Cukup untuk satu instance; pindah ke tabel/Redis kalau app di-scale.
  if (jejak.size > 5000) jejak.clear();
}

export const POST = handler(async (req) => {
  const ip = ambilIp(req);
  if (sudahMelebihiBatas(ip))
    return gagal(429, "Terlalu banyak pesan. Coba lagi beberapa menit lagi.");

  const body = await req.json();
  // Validasi dulu: form yang salah isi tidak boleh menghabiskan jatah kirim.
  const data = kontakSchema.parse(body);

  // Honeypot terisi → bot. Balas sukses agar bot tidak belajar.
  if (data.website) return NextResponse.json({ ok: true });

  await prisma.pesanKontak.create({
    data: { nama: data.nama, whatsapp: data.whatsapp, pesan: data.pesan },
  });

  catatKiriman(ip);
  return NextResponse.json({ ok: true }, { status: 201 });
});
