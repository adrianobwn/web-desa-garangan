import Link from "next/link";
import { Foto } from "@/components/Foto";
import { tanggalPanjang } from "@/lib/util";

type Berita = {
  slug: string;
  judul: string;
  ringkasan?: string;
  gambarSampul: string | null;
  tanggalTerbit: Date | null;
  dibaca?: number;
  kategori: { nama: string };
  penulis?: { nama: string };
};

export function KartuBerita({
  berita,
  tinggiFoto = 180,
  ringkasan = true,
  sizes = "(max-width: 640px) 100vw, 33vw",
}: {
  berita: Berita;
  tinggiFoto?: number;
  ringkasan?: boolean;
  sizes?: string;
}) {
  return (
    <article className="card">
      <Link
        href={`/berita/${berita.slug}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <figure style={{ margin: "0 0 16px" }}>
          <Foto
            src={berita.gambarSampul}
            alt={berita.judul}
            tinggi={tinggiFoto}
            sizes={sizes}
          />
        </figure>
        <span className="tag tag-neutral">{berita.kategori.nama}</span>
        <h3 className="card-title" style={{ marginTop: 12 }}>
          {berita.judul}
        </h3>
        {ringkasan && berita.ringkasan && (
          <p className="card-body" style={{ marginTop: 8 }}>
            {berita.ringkasan}
          </p>
        )}
        <p className="card-meta" style={{ marginTop: 12 }}>
          {tanggalPanjang(berita.tanggalTerbit)}
          {berita.dibaca !== undefined
            ? ` · ${berita.dibaca} dibaca`
            : berita.penulis
              ? ` · ${berita.penulis.nama}`
              : ""}
        </p>
      </Link>
    </article>
  );
}
