"use client";

import { useEffect } from "react";

/**
 * Menaikkan penghitung "dibaca" sekali per sesi tab.
 * ponytail: sessionStorage, bukan dedup per-IP di server. Cukup untuk statistik
 * kasar; kalau angkanya nanti dipakai untuk laporan resmi, pindahkan ke
 * penghitung server dengan window per-IP.
 */
export function HitungDibaca({ slug }: { slug: string }) {
  useEffect(() => {
    const kunci = `dibaca:${slug}`;
    if (sessionStorage.getItem(kunci)) return;
    sessionStorage.setItem(kunci, "1");
    fetch(`/api/berita/dibaca/${slug}`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
