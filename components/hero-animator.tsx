"use client";

/**
 * Animasi intro hero dengan anime.js v4 (subpath modular `scope`/`waapi`/`utils`, di-import
 * dinamis) — port web-starter `src/components/hero/hero-animator.tsx` (commit d5f6148), G-38.
 * Dipakai hero beranda DAN <HeroHalaman> (produk ×3, pricing, tentang, kontak) — satu pola.
 * - Dimulai saat IDLE (requestIdleCallback + fallback) → di luar jendela TBT; teks hero sudah
 *   tampil penuh sejak first paint (LCP tidak menunggu JS). Intro hanya "aksen": coretan kata
 *   sorotan digambar (scaleX), baris hero diberi gerak angkat singkat bertahap (stagger) dari
 *   posisi akhirnya — menggantikan `animate-muncul-naik` CSS yang menyembunyikan <h1> (opacity 0)
 *   sampai animasinya jalan.
 * - createScope({ root }) membatasi selector ke subtree hero; `scope.revert()` saat unmount.
 * - Dilewati bila `prefers-reduced-motion: reduce` (coretan tampil penuh via CSS).
 * - Adapter WAAPI: transform dijalankan browser di thread compositor (web-starter mengukur TBT
 *   median 636 → 325 ms dibanding engine JS).
 */
import { useEffect, useRef, type ReactNode } from "react";
import type { Scope } from "animejs";
import { onIdle } from "@/lib/idle";

export function HeroAnimator({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cancelIdle = onIdle(() => {
      void Promise.all([import("animejs/scope"), import("animejs/waapi"), import("animejs/utils")]).then(
        ([{ createScope }, { waapi }, { stagger }]) => {
          if (cancelled || !root.current) return;
          scope.current = createScope({
            root,
            mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" },
          }).add((self) => {
            if (self?.matches.reduce) return;
            const el = root.current;
            if (!el) return;
            // anime.js mengambil alih coretan → matikan fallback CSS-nya.
            const coretan = el.querySelectorAll<HTMLElement>('[data-hero-init="underline"]');
            coretan.forEach((u) => (u.style.animation = "none"));
            // Tanpa target anime.js menulis peringatan konsol → hanya animasikan yang ada.
            if (coretan.length) {
              waapi.animate(coretan, {
                transform: ["scaleX(0)", "scaleX(1)"],
                duration: 1100,
                delay: 250,
                ease: "outExpo",
                persist: true,
              });
            }
            if (!el.querySelector('[data-hero-init="lift"]')) return;
            waapi.animate('[data-hero-init="lift"]', {
              transform: ["translateY(0px)", "translateY(-6px)", "translateY(0px)"],
              duration: 800,
              delay: stagger(90),
              ease: "outExpo",
            });
          });
        },
      );
    }, 1200);
    return () => {
      cancelled = true;
      cancelIdle();
      scope.current?.revert();
    };
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
