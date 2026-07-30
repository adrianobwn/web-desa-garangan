import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { Paginasi } from "@/components/publik/Paginasi";
import { TombolDibalas } from "@/components/admin/TombolDibalas";
import { paginasiSchema } from "@/lib/validasi";
import { tanggalPanjang } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function AdminPesan({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = paginasiSchema.safeParse({ ...sp, perPage: 20 });
  const { page, perPage } = parsed.success ? parsed.data : { page: 1, perPage: 20 };

  const [items, total, belum] = await Promise.all([
    prisma.pesanKontak.findMany({
      orderBy: [{ statusDibalas: "asc" }, { tanggal: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.pesanKontak.count(),
    prisma.pesanKontak.count({ where: { statusDibalas: false } }),
  ]);

  return (
    <>
      <HeaderAdmin
        judul="Pesan Masuk"
        sub={`${total} pesan · ${belum} belum dibalas`}
      />

      <div style={{ padding: "32px 40px" }}>
        {items.length === 0 && (
          <p className="text-muted">Belum ada pesan dari warga.</p>
        )}
        {items.map((p) => (
          <article
            key={p.id}
            style={{
              border: "2px solid var(--color-divider)",
              padding: "20px 24px",
              marginBottom: 16,
              background: p.statusDibalas ? undefined : "var(--color-accent-100)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                  {p.nama}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-neutral-700)",
                    margin: "4px 0 0",
                  }}
                >
                  {p.whatsapp} · {tanggalPanjang(p.tanggal)}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <a
                  className="btn btn-secondary"
                  href={`https://wa.me/${p.whatsapp.replace(/^0/, "62").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Balas via WhatsApp
                </a>
                <TombolDibalas id={p.id} dibalas={p.statusDibalas} />
              </div>
            </div>
            <p
              style={{
                fontSize: 15,
                lineHeight: "24px",
                margin: "16px 0 0",
                whiteSpace: "pre-wrap",
              }}
            >
              {p.pesan}
            </p>
          </article>
        ))}

        <Paginasi
          page={page}
          totalHalaman={Math.max(1, Math.ceil(total / perPage))}
          buatHref={(p) => (p > 1 ? `/admin/pesan?page=${p}` : "/admin/pesan")}
        />
      </div>
    </>
  );
}
