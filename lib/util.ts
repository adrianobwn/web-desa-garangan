const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const BULAN_SINGKAT = BULAN.map((b) => b.slice(0, 3));

/** "24 Juli 2026" */
export function tanggalPanjang(d: Date | string | null | undefined) {
  if (!d) return "—";
  const t = new Date(d);
  return `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
}

/** "24 Jul 2026" */
export function tanggalPendek(d: Date | string | null | undefined) {
  if (!d) return "—";
  const t = new Date(d);
  return `${t.getDate()} ${BULAN_SINGKAT[t.getMonth()]} ${t.getFullYear()}`;
}

/** "Senin, 27 Juli 2026" — dipakai topbar & header admin. */
export function tanggalLengkap(d: Date = new Date()) {
  return `${HARI[d.getDay()]}, ${tanggalPanjang(d)}`;
}

export const namaBulan = (i: number) => BULAN[i];

/** Angka gaya Indonesia: 4.212 */
export const angka = (n: number) => n.toLocaleString("id-ID");

/** Persentase gaya Indonesia: 21,5% — desimal pakai koma, bukan titik. */
export const persen = (n: number) =>
  `${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * URL Cloudinary dengan transform di jalur — hemat bandwidth untuk foto besar.
 * URL non-Cloudinary dikembalikan apa adanya.
 */
export function fotoTransform(url: string, lebar: number) {
  if (!url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/w_${lebar},c_limit,q_auto,f_auto/`,
  );
}
