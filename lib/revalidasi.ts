import { revalidatePath } from "next/cache";

/**
 * Halaman publik di-cache (ISR). Setelah admin menyimpan, cache harus dibuang
 * agar perubahan langsung terlihat — bukan menunggu jendela revalidate lewat.
 */
export function segarkanBerita(slug?: string) {
  revalidatePath("/");
  revalidatePath("/berita");
  if (slug) revalidatePath(`/berita/${slug}`);
  revalidatePath("/sitemap.xml");
}

export function segarkan(...jalur: string[]) {
  revalidatePath("/");
  for (const j of jalur) revalidatePath(j);
}
