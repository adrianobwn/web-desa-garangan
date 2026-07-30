"use client";

import { useState } from "react";

/**
 * URL dibaca saat tombol ditekan, bukan lewat useEffect — tidak ada state yang
 * perlu disinkronkan, dan tautan share selalu memakai URL terkini.
 */
export function TombolBagikan({ judul }: { judul: string }) {
  const [disalin, setDisalin] = useState(false);

  const urlKini = () =>
    typeof window === "undefined" ? "" : window.location.href;

  function bagikan(buatUrl: (u: string) => string) {
    window.open(buatUrl(urlKini()), "_blank", "noopener,noreferrer");
  }

  async function salin() {
    await navigator.clipboard.writeText(urlKini());
    setDisalin(true);
    setTimeout(() => setDisalin(false), 2000);
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span
        style={{
          fontSize: 12,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "var(--color-neutral-700)",
          marginRight: 4,
        }}
      >
        Bagikan
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ padding: "6px 12px", fontSize: 13 }}
        onClick={() =>
          bagikan((u) => `https://wa.me/?text=${encodeURIComponent(`${judul} ${u}`)}`)
        }
      >
        WhatsApp
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ padding: "6px 12px", fontSize: 13 }}
        onClick={() =>
          bagikan(
            (u) =>
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
          )
        }
      >
        Facebook
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ padding: "6px 12px", fontSize: 13 }}
        onClick={salin}
      >
        {disalin ? "Tersalin ✓" : "Salin tautan"}
      </button>
    </div>
  );
}
