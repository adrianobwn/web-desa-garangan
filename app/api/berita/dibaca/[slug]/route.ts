import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api";
import { filterPublik } from "@/lib/queries";

/** POST /api/berita/[slug]/dibaca — naikkan penghitung baca. */
export const POST = handler(async (_req, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  // updateMany + filter publik: draf tidak bisa dipompa penghitungnya.
  const { count } = await prisma.berita.updateMany({
    where: { slug, ...filterPublik() },
    data: { dibaca: { increment: 1 } },
  });
  return NextResponse.json({ ok: count > 0 });
});
