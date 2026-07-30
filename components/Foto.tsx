import Image from "next/image";

/**
 * Foto konten. Kalau URL kosong (data seed / belum diunggah) tampil placeholder
 * abu-abu berlabel seperti `.ph` di file desain, jadi layout tetap utuh.
 * Semua foto konten di-treat grayscale sesuai token desain.
 */
export function Foto({
  src,
  alt,
  tinggi,
  sizes = "100vw",
  priority,
  fill = true,
}: {
  src?: string | null;
  alt: string;
  tinggi: number | string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const style = { height: tinggi, width: "100%" } as const;

  if (!src) {
    // Label placeholder dipotong agar judul panjang tidak melebarkan halaman
    // di layar 390px (teks .ph tidak boleh jadi penentu lebar minimum).
    return (
      <div className="ph grayscale" style={style} aria-hidden="true">
        <span className="ph-label">{alt}</span>
      </div>
    );
  }

  return (
    <div
      className="grayscale"
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
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
