import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "@/lib/api";
import { MAKS_UKURAN_FILE, MIME_GAMBAR, uploadSchema } from "@/lib/validasi";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Magic bytes — nama file & Content-Type dari klien bisa dipalsukan. */
function deteksiMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")))
    return "image/png";
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function unggahGambar(file: File, folder = "desa-garangan") {
  // 1. Validasi metadata yang diklaim klien.
  uploadSchema.parse({ type: file.type, size: file.size });

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > MAKS_UKURAN_FILE)
    throw new ApiError(413, "Ukuran file maksimal 10MB");

  // 2. Validasi isi file sebenarnya, dan pastikan cocok dengan yang diklaim.
  const asli = deteksiMime(buf);
  if (!asli || !MIME_GAMBAR.includes(asli as (typeof MIME_GAMBAR)[number]))
    throw new ApiError(415, "File bukan gambar JPG/PNG/WebP yang valid");
  if (asli !== file.type)
    throw new ApiError(415, "Tipe file tidak sesuai isi berkas");

  if (!process.env.CLOUDINARY_API_KEY)
    throw new ApiError(503, "Penyimpanan gambar belum dikonfigurasi");

  const hasil = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            // Batasi ukuran simpan; transform tampilan diatur per komponen.
            transformation: [
              { width: 2000, height: 2000, crop: "limit" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (err, res) =>
            err || !res
              ? reject(err ?? new Error("Unggah gagal"))
              : resolve(res as never),
        )
        .end(buf);
    },
  );

  return { url: hasil.secure_url, publicId: hasil.public_id };
}

export async function hapusGambar(publicId: string) {
  if (!publicId || !process.env.CLOUDINARY_API_KEY) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    // File yatim di Cloudinary lebih baik daripada record DB yang gagal terhapus.
    console.error("[cloudinary] gagal hapus", publicId, e);
  }
}
