import Link from "next/link";

/** Paginasi berbasis tautan — bekerja tanpa JS, ramah SEO. */
export function Paginasi({
  page,
  totalHalaman,
  buatHref,
}: {
  page: number;
  totalHalaman: number;
  buatHref: (p: number) => string;
}) {
  if (totalHalaman <= 1) return null;

  // Tampilkan halaman 1..3, elipsis, halaman terakhir — seperti desain.
  const nomor = new Set<number>([1, totalHalaman, page]);
  for (let i = 2; i <= Math.min(3, totalHalaman); i++) nomor.add(i);
  if (page > 1) nomor.add(page - 1);
  if (page < totalHalaman) nomor.add(page + 1);
  const urut = [...nomor].filter((n) => n >= 1 && n <= totalHalaman).sort((a, b) => a - b);

  return (
    <nav
      aria-label="Paginasi"
      style={{
        display: "flex",
        gap: 8,
        marginTop: 48,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {page > 1 ? (
        <Link href={buatHref(page - 1)} className="btn btn-secondary">
          ← Sebelumnya
        </Link>
      ) : (
        <button type="button" className="btn btn-secondary" disabled>
          ← Sebelumnya
        </button>
      )}

      {urut.map((n, i) => (
        <span key={n} style={{ display: "contents" }}>
          {i > 0 && urut[i - 1] !== n - 1 && (
            <span
              style={{
                fontSize: 14,
                padding: "8px 6px",
                color: "var(--color-neutral-700)",
              }}
            >
              …
            </span>
          )}
          {n === page ? (
            <span
              aria-current="page"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: 14,
                padding: "8px 14px",
                background: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              {n}
            </span>
          ) : (
            <Link
              href={buatHref(n)}
              style={{ fontSize: 14, padding: "8px 14px", textDecoration: "none" }}
            >
              {n}
            </Link>
          )}
        </span>
      ))}

      {page < totalHalaman ? (
        <Link href={buatHref(page + 1)} className="btn btn-secondary">
          Berikutnya →
        </Link>
      ) : (
        <button type="button" className="btn btn-secondary" disabled>
          Berikutnya →
        </button>
      )}
    </nav>
  );
}
