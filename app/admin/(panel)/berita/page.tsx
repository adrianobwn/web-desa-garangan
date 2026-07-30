import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { daftarBerita } from "@/lib/queries";
import { beritaQuerySchema } from "@/lib/validasi";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { Paginasi } from "@/components/publik/Paginasi";
import { Foto } from "@/components/Foto";
import { tanggalPendek } from "@/lib/util";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 15;

export default async function AdminBerita({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = beritaQuerySchema.safeParse(sp);
  const { page, q, kategori, status } = parsed.success
    ? parsed.data
    : { page: 1, q: undefined, kategori: undefined, status: undefined };

  const [hasil, kategoriList, total] = await Promise.all([
    daftarBerita({ page, perPage: PER_HALAMAN, q, kategori, status }),
    prisma.kategori.findMany({ orderBy: { nama: "asc" } }),
    prisma.berita.count(),
  ]);

  const buatHref = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (kategori) u.set("kategori", kategori);
    if (status) u.set("status", status);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/admin/berita?${s}` : "/admin/berita";
  };

  return (
    <>
      <HeaderAdmin
        judul="Manajemen Berita"
        sub={`${total} artikel total`}
        aksi={
          <Link href="/admin/berita/baru" className="btn btn-primary">
            + Tulis berita
          </Link>
        }
      />

      {/* Form GET — filter tetap ada di URL, bisa di-bookmark & di-refresh. */}
      <form
        action="/admin/berita"
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-end",
          padding: "20px 40px",
          borderBottom: "2px solid var(--color-divider)",
          flexWrap: "wrap",
        }}
      >
        <div className="field" style={{ flex: 1, minWidth: 200, margin: 0 }}>
          <input
            className="input"
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari judul berita…"
            aria-label="Cari judul berita"
          />
        </div>
        <select
          className="input"
          name="kategori"
          defaultValue={kategori ?? ""}
          style={{ width: 200 }}
          aria-label="Filter kategori"
        >
          <option value="">Semua kategori</option>
          {kategoriList.map((k) => (
            <option key={k.id} value={k.slug}>
              {k.nama}
            </option>
          ))}
        </select>
        <select
          className="input"
          name="status"
          defaultValue={status ?? ""}
          style={{ width: 160 }}
          aria-label="Filter status"
        >
          <option value="">Semua status</option>
          <option value="TERBIT">Terbit</option>
          <option value="DRAF">Draf</option>
        </select>
        <button type="submit" className="btn btn-secondary">
          Terapkan
        </button>
      </form>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 64 }} />
              <th>Judul</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Dibaca</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {hasil.items.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 24 }} className="text-muted">
                  Tidak ada berita yang cocok dengan filter ini.
                </td>
              </tr>
            )}
            {hasil.items.map((b) => (
              <tr key={b.id}>
                <td>
                  <div style={{ width: 56 }}>
                    <Foto
                      src={b.gambarSampul}
                      alt="Sampul"
                      tinggi={40}
                      sizes="56px"
                    />
                  </div>
                </td>
                <td style={{ maxWidth: 420 }}>
                  <Link href={`/admin/berita/${b.id}`}>{b.judul}</Link>
                </td>
                <td>{b.kategori.nama}</td>
                <td>
                  <span
                    className={`tag ${b.status === "TERBIT" ? "tag-accent" : "tag-neutral"}`}
                  >
                    {b.status === "TERBIT" ? "Terbit" : "Draf"}
                  </span>
                </td>
                <td className="tnum">{tanggalPendek(b.tanggalTerbit)}</td>
                <td className="tnum">{b.dibaca || "—"}</td>
                <td>
                  <Link href={`/admin/berita/${b.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "0 40px 32px" }}>
        <Paginasi
          page={hasil.page}
          totalHalaman={hasil.totalHalaman}
          buatHref={buatHref}
        />
      </div>
    </>
  );
}
