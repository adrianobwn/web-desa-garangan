import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { Paginasi } from "@/components/publik/Paginasi";
import { paginasiSchema } from "@/lib/validasi";
import { tanggalLengkap } from "@/lib/util";

export const dynamic = "force-dynamic";

const WARNA: Record<string, string> = {
  CREATE: "tag-accent",
  UPDATE: "tag-neutral",
  DELETE: "tag-outline",
  LOGIN: "tag-neutral",
  LOGIN_GAGAL: "tag-outline",
};

export default async function AdminAudit({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = paginasiSchema.safeParse({ ...sp, perPage: 30 });
  const { page, perPage } = parsed.success ? parsed.data : { page: 1, perPage: 30 };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { nama: true, username: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <>
      <HeaderAdmin
        judul="Log Aktivitas"
        sub={`${total} catatan — siapa mengubah apa dan kapan`}
      />

      <div className="table-scroll" style={{ padding: "0 40px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Pengguna</th>
              <th>Aksi</th>
              <th>Entitas</th>
              <th>Keterangan</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted" style={{ padding: 24 }}>
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            )}
            {items.map((l) => (
              <tr key={l.id}>
                <td className="tnum" style={{ whiteSpace: "nowrap" }}>
                  {tanggalLengkap(l.createdAt)}
                  <br />
                  <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                    {l.createdAt.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
                <td>{l.user?.nama ?? "—"}</td>
                <td>
                  <span className={`tag ${WARNA[l.aksi] ?? "tag-neutral"}`}>
                    {l.aksi}
                  </span>
                </td>
                <td>{l.entitas}</td>
                <td style={{ maxWidth: 380 }}>{l.ringkasan ?? "—"}</td>
                <td style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                  {l.ip ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "0 40px 32px" }}>
        <Paginasi
          page={page}
          totalHalaman={Math.max(1, Math.ceil(total / perPage))}
          buatHref={(p) => (p > 1 ? `/admin/audit?page=${p}` : "/admin/audit")}
        />
      </div>
    </>
  );
}
