/**
 * Animated Grid Pattern — 21st.dev: https://21st.dev/@dillionverma/components/animated-grid-pattern
 * (license: MIT). Author: Dillion Verma / Magic UI. Upstream source: magicuidesign/magicui
 * @ d7207e5692d14c00dceafa8488d6d01f197fa0e4 apps/www/registry/magicui/animated-grid-pattern.tsx (MIT).
 * Disalin dari web-starter `src/components/ui-21st/animated-grid-pattern.tsx` (2026-09-26, G-39). Adaptasi BCT: warna `text-primary`/`stroke-border` → token BCT `text-accent`/`stroke-line`; `cn` → `kelas` (tanpa clsx/tailwind-merge).
 * Detail provenance & perubahan: COMPONENTS.md.
 *
 * Adaptasi performa (terukur Lighthouse mobile): upstream menganimasikan `opacity` tiap <rect> SVG
 * via Motion (JS per frame; elemen SVG tidak bisa di-composite → style/paint tiap frame). Di sini
 * garis grid tetap SVG statis, sedangkan kotak berkedip dirender sebagai elemen HTML absolut
 * dengan CSS keyframes opacity (dijalankan compositor, tanpa JS per frame). Posisi acak baru
 * tetap diambil saat siklus selesai (animationend), seperti upstream. Animasi dijeda saat di luar
 * viewport; reduced motion atau di luar `animateMedia` → hanya grid statis.
 * Hydration minimal: komponen ini SERVER component (garis grid SVG statis); hanya kotak berkedip
 * yang client (animated-grid-squares.tsx), dimulai saat idle. Props API sama dengan upstream. Hook motion/react
 * diganti hook kecil lokal (lib/use-motion-prefs.ts) agar Motion tidak masuk JS awal.
 */
import { useId, type ComponentPropsWithoutRef } from "react";
import { AnimatedGridSquares } from "@/components/ui-21st/animated-grid-squares";
import { kelas } from "@/components/styles";

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"div"> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  /** Detik untuk fade-in (fade-out sama panjang), seperti upstream. */
  duration?: number;
  repeatDelay?: number;
  /**
   * (Tambahan web-starter) Media query agar kotak berkedip aktif, mis. "(min-width: 768px)".
   * Di luar query hanya grid statis yang dirender (hemat CPU mobile). Default: selalu aktif.
   */
  animateMedia?: string;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  animateMedia,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  return (
    <div
      aria-hidden="true"
      className={kelas("pointer-events-none absolute inset-0 h-full w-full overflow-hidden text-accent", className)}
      {...props}
    >
      <svg className="absolute inset-0 h-full w-full fill-none stroke-line">
        <defs>
          <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
            <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <AnimatedGridSquares
        width={width}
        height={height}
        x={x}
        y={y}
        numSquares={numSquares}
        maxOpacity={maxOpacity}
        duration={duration}
        repeatDelay={repeatDelay}
        media={animateMedia}
      />
    </div>
  );
}
