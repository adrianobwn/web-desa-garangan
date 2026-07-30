import { NextResponse } from "next/server";
import { ambilIp, ApiError, catatAudit, handler, wajibAdmin } from "@/lib/api";
import { unggahGambar } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * POST /api/upload — multipart, field "file".
 * Validasi MIME + ukuran + magic bytes ada di lib/cloudinary.ts.
 */
export const POST = handler(async (req) => {
  const user = await wajibAdmin();

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "File tidak ditemukan");

  const folder =
    form.get("folder") === "galeri"
      ? "desa-garangan/galeri"
      : "desa-garangan/berita";

  const hasil = await unggahGambar(file, folder);

  await catatAudit({
    userId: user.id,
    aksi: "CREATE",
    entitas: "Upload",
    entitasId: hasil.publicId,
    ringkasan: `Mengunggah gambar (${Math.round(file.size / 1024)} KB)`,
    ip: ambilIp(req),
  });

  return NextResponse.json(hasil, { status: 201 });
});
