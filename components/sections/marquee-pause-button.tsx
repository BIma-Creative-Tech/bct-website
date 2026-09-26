"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { fokusRing, kelas } from "@/components/styles";

/**
 * Tombol jeda/putar marquee (WCAG 2.2.2) — port web-starter
 * `src/components/sections/marquee-pause-button.tsx`. Pulau client kecil: hanya men-toggle
 * atribut `data-marquee-paused` pada elemen target; <Marquee> (server) membaca atribut itu
 * via CSS. Label berganti Jeda/Putar (tanpa `aria-pressed` — label yang berubah + status tekan
 * akan dibacakan ganda). Label dari copy (content/copy). Disembunyikan saat reduced motion (marquee sudah diam).
 *
 * TIDAK diekspor lewat barrel components/sections (aturan batas klien di index.ts).
 */
export function MarqueePauseButton({
  targetId,
  labelJeda,
  labelPutar,
}: {
  targetId: string;
  labelJeda: string;
  labelPutar: string;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      aria-controls={targetId}
      onClick={() => {
        const next = !paused;
        setPaused(next);
        document.getElementById(targetId)?.setAttribute("data-marquee-paused", String(next));
      }}
      className={kelas(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink-2 hover:border-accent hover:text-accent motion-safe:transition-colors motion-reduce:hidden",
        fokusRing,
      )}
    >
      {/* `key`: pasang ulang <iconsax-icon> saat ikon berganti (lihat IconsaxLoader). */}
      <Icon key={paused ? "putar" : "jeda"} name={paused ? "play" : "pause"} size={16} />
      {paused ? labelPutar : labelJeda}
    </button>
  );
}
