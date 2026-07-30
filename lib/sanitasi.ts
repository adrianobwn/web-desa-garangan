import sanitizeHtml from "sanitize-html";

// Allowlist ketat: hanya tag yang benar-benar dipakai editor berita.
// Disanitasi saat SIMPAN (bukan hanya saat tampil), jadi yang tersimpan di DB
// sudah bersih — kalau nanti dirender di tempat lain tetap aman.
const opsi: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "figure",
    "figcaption",
    "hr",
  ],
  allowedAttributes: {
    // "rel" harus ada di allowlist, kalau tidak hasil transformTags ikut dibuang.
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "title", "width", "height"],
  },
  // Tidak ada javascript: / data: — cegah XSS lewat href & src.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  transformTags: {
    // Tautan keluar tidak boleh bisa mengendalikan tab asal.
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
    }),
  },
  disallowedTagsMode: "discard",
};

export function bersihkanHtml(kotor: string): string {
  return sanitizeHtml(kotor, opsi);
}

/** Teks polos untuk meta description / ringkasan pencarian. */
export function keTeksPolos(html: string, maks = 160): string {
  // Sisipkan spasi di batas blok dulu, jika tidak "</h2><p>" jadi "JudulIsi".
  const teks = sanitizeHtml(html.replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, "$& "), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
  return teks.length > maks ? `${teks.slice(0, maks - 1)}…` : teks;
}
