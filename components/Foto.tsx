import Image from "next/image";

/**
 * Foto konten. Kalau URL kosong (data seed / belum diunggah) tampil placeholder
 * abu-abu berlabel seperti `.ph` di file desain, jadi layout tetap utuh.
 * Foto ditampilkan berwarna: dokumentasi desa justru kehilangan isinya kalau
 * dibuat hitam-putih.
 */
export function Foto({
  src,
  alt,
  tinggi,
  sizes = "100vw",
  priority,
  fill = true,
  utuh = false,
}: {
  src?: string | null;
  alt: string;
  tinggi: number | string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  /** Tampilkan seluruh gambar apa adanya, tanpa dipotong. `tinggi` jadi
   *  batas maksimum, bukan tinggi paksa. Dipakai untuk foto yang isinya
   *  penting seutuhnya, mis. foto kegiatan warga. */
  utuh?: boolean;
}) {
  const style = { height: tinggi, width: "100%" } as const;

  if (!src) {
    // Label placeholder dipotong agar judul panjang tidak melebarkan halaman
    // di layar 390px (teks .ph tidak boleh jadi penentu lebar minimum).
    // Placeholder tetap abu-abu: ini penanda "belum ada foto", bukan foto.
    return (
      <div className="ph" style={style} aria-hidden="true">
        <span className="ph-label">{alt}</span>
      </div>
    );
  }

  // Tanpa fill + height:auto: tinggi mengikuti rasio asli, tidak ada yang
  // terpotong. width/height di bawah hanya rasio acuan bagi Next.
  if (utuh) {
    return (
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1200}
        sizes={sizes}
        priority={priority}
        style={{
          width: "100%",
          height: "auto",
          maxHeight: tinggi,
          objectFit: "contain",
        }}
      />
    );
  }

  return (
    <div style={{ ...style, position: "relative", overflow: "hidden" }}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
