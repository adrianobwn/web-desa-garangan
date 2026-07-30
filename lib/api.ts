import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Error handling terpusat. Stack trace TIDAK pernah keluar ke publik —
 * detail hanya masuk log server, klien cuma dapat pesan aman + kode.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const gagal = (status: number, pesan: string) =>
  NextResponse.json({ error: pesan }, { status });

export function tanganiError(e: unknown): NextResponse {
  if (e instanceof ZodError) {
    // Pesan validasi aman ditampilkan — memang untuk dibaca pengisi form.
    return NextResponse.json(
      {
        error: "Data tidak valid",
        detail: e.issues.map((i) => ({
          field: i.path.join("."),
          pesan: i.message,
        })),
      },
      { status: 422 },
    );
  }
  if (e instanceof ApiError) return gagal(e.status, e.message);

  // Prisma & error tak terduga: log lengkap di server, generik ke klien.
  console.error("[api]", e);
  const kode = (e as { code?: string } | null)?.code;
  if (kode === "P2002") return gagal(409, "Data serupa sudah ada");
  if (kode === "P2025") return gagal(404, "Data tidak ditemukan");
  return gagal(500, "Terjadi kesalahan pada server");
}

/** Bungkus handler: satu tempat untuk try/catch. */
export function handler<T extends unknown[]>(
  fn: (req: Request, ...args: T) => Promise<NextResponse>,
) {
  return async (req: Request, ...args: T) => {
    try {
      return await fn(req, ...args);
    } catch (e) {
      return tanganiError(e);
    }
  };
}

/** Wajib login. Lempar 401 kalau tidak ada sesi. */
export async function wajibAdmin() {
  const sesi = await auth();
  if (!sesi?.user?.id) throw new ApiError(401, "Tidak terautentikasi");
  return sesi.user as { id: string; name?: string | null; role?: string };
}

export function ambilIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/** Catat aktivitas admin. Gagal mencatat tidak boleh menggagalkan aksi utama. */
export async function catatAudit(input: {
  userId?: string | null;
  aksi: string;
  entitas: string;
  entitasId?: string | null;
  ringkasan?: string | null;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({ data: input });
  } catch (e) {
    console.error("[audit] gagal mencatat", e);
  }
}
