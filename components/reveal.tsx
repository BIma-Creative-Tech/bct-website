import type { CSSProperties, ReactNode } from "react";

/**
 * Reveal saat di-scroll ke viewport (sekali) — SERVER component, port web-starter
 * `src/components/reveal.tsx` (G-38). Hanya menandai elemen (`data-reveal`, jeda lewat CSS var
 * `--reveal-delay`); <ScrollEnhancer> (satu pulau client di root layout, mulai saat idle)
 * "mempersenjatai" elemen yang masih di bawah viewport lalu memicu animasi CSS `muncul-naik`
 * (opacity + transform, compositor) saat terlihat. Tanpa JS / reduced motion → konten langsung
 * tampil, tidak pernah terjebak tersembunyi.
 *
 * Beda dari web-starter: reveal memakai CSS *animation* (bukan transition) agar tidak menimpa
 * `transition` hover `kartuInteraktif` (lihat app/globals.css §Reveal).
 */

/** Atribut reveal untuk disebar ke elemen yang sudah ada (mis. `<li>` kartu dalam `.map`). */
export function propsReveal(urutan = 0, langkah = 0.06): { "data-reveal": ""; style?: CSSProperties } {
  const jeda = Math.min(urutan, 5) * langkah;
  return jeda
    ? { "data-reveal": "", style: { "--reveal-delay": `${jeda.toFixed(2)}s` } as CSSProperties }
    : { "data-reveal": "" };
}

export function Reveal({
  children,
  className,
  urutan = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Posisi dalam daftar → jeda stagger 60 ms/butir (maks 5 butir). */
  urutan?: number;
}) {
  return (
    <div className={className} {...propsReveal(urutan)}>
      {children}
    </div>
  );
}
