/**
 * Marquee — 21st.dev: https://21st.dev/@dillionverma/components/marquee (license: MIT)
 * Author: Dillion Verma / Magic UI. Upstream source: magicuidesign/magicui
 * @ d7207e5692d14c00dceafa8488d6d01f197fa0e4 apps/www/registry/magicui/marquee.tsx (MIT).
 * Disalin dari web-starter `src/components/ui-21st/marquee.tsx` (2026-09-26, G-39).
 * Detail provenance & perubahan: COMPONENTS.md.
 *
 * Adaptasi (web-starter): salinan konten ke-2..n `aria-hidden` (pembaca layar hanya membaca
 * sekali); prop `paused` dan/atau atribut `data-marquee-paused="true"` pada ancestor (kontrol
 * jeda eksplisit, WCAG 2.2.2 — lihat <MarqueePauseButton>); jeda saat hover/fokus; reduced
 * motion → animasi mati, hanya salinan pertama yang tampil dan bisa di-scroll horizontal.
 * Adaptasi BCT: `cn` → `kelas`; varian vertikal dibuang (tidak dipakai); durasi lewat prop
 * `durasi` (CSS var inline) — `kelas` tidak menggabung kelas yang bentrok seperti tailwind-merge.
 */
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { kelas } from "@/components/styles";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  paused?: boolean;
  children: ReactNode;
  repeat?: number;
  /** Detik per putaran (default 40). */
  durasi?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  paused = false,
  children,
  repeat = 4,
  durasi = 40,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      style={{ "--duration": `${durasi}s`, "--gap": "1rem", ...style } as CSSProperties}
      className={kelas("group flex flex-row gap-(--gap) overflow-hidden p-2 motion-reduce:overflow-x-auto", className)}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          className={kelas(
            "flex shrink-0 animate-marquee flex-row justify-around gap-(--gap) motion-reduce:animate-none",
            pauseOnHover && "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
            paused && "[animation-play-state:paused]",
            "[[data-marquee-paused=true]_&]:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
            i > 0 && "motion-reduce:hidden",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
