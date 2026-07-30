import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { KelolaAgenda } from "@/components/admin/KelolaAgenda";

export const dynamic = "force-dynamic";

export default async function AdminAgenda() {
  const [agenda, pengumuman] = await Promise.all([
    prisma.agenda.findMany({ orderBy: { tanggal: "desc" }, take: 50 }),
    prisma.pengumuman.findMany({
      orderBy: [{ disematkan: "desc" }, { tanggal: "desc" }],
      take: 50,
    }),
  ]);

  return (
    <>
      <HeaderAdmin
        judul="Agenda & Pengumuman"
        sub={`${agenda.length} agenda · ${pengumuman.length} pengumuman`}
      />
      <KelolaAgenda
        agenda={agenda.map((a) => ({
          ...a,
          tanggal: a.tanggal.toISOString(),
        }))}
        pengumuman={pengumuman.map((p) => ({
          ...p,
          tanggal: p.tanggal.toISOString(),
        }))}
      />
    </>
  );
}
