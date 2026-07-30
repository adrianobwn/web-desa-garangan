import { prisma } from "@/lib/prisma";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";
import { FormStatistik, type NilaiStatistik } from "@/components/admin/FormStatistik";
import type { Distribusi, PerDusun } from "@/lib/queries";
import { tanggalPanjang } from "@/lib/util";

export const dynamic = "force-dynamic";

const KOSONG: NilaiStatistik = {
  totalPenduduk: 0,
  jumlahKk: 0,
  lakiLaki: 0,
  perempuan: 0,
  luasWilayahHa: 527,
  jumlahBekerja: 0,
  perDusun: [],
  mataPencaharian: [],
  pendidikan: [],
  kelompokUsia: [],
};

export default async function AdminStatistik() {
  const stat = await prisma.statistik.findUnique({ where: { id: "singleton" } });

  const awal: NilaiStatistik = stat
    ? {
        totalPenduduk: stat.totalPenduduk,
        jumlahKk: stat.jumlahKk,
        lakiLaki: stat.lakiLaki,
        perempuan: stat.perempuan,
        luasWilayahHa: stat.luasWilayahHa,
        jumlahBekerja: stat.jumlahBekerja,
        perDusun: (stat.perDusun as PerDusun[]) ?? [],
        mataPencaharian: (stat.mataPencaharian as Distribusi[]) ?? [],
        pendidikan: (stat.pendidikan as Distribusi[]) ?? [],
        kelompokUsia: (stat.kelompokUsia as Distribusi[]) ?? [],
      }
    : KOSONG;

  return (
    <>
      <HeaderAdmin
        judul="Statistik Penduduk"
        sub={
          stat
            ? `Terakhir diperbarui: ${tanggalPanjang(stat.terakhirDiperbarui)}`
            : "Belum pernah diisi"
        }
      />
      <FormStatistik awal={awal} />
    </>
  );
}
