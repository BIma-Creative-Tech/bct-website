"use client";

/**
 * Satu client component kecil untuk interaktivitas di bawah lipatan — port web-starter
 * `src/components/scroll-enhancer.tsx` (G-38):
 * - Reveal: `[data-reveal]` yang masih di bawah viewport diberi `data-reveal-state="armed"`
 *   (CSS menyembunyikan), lalu `"in"` saat masuk viewport (animasi CSS opacity/transform).
 * - Number Ticker (21st.dev/Magic UI): `[data-ticker]` dihitung dengan spring Motion
 *   (damping 60, stiffness 100 — sama dengan upstream) yang di-import DINAMIS saat terlihat.
 * Mulai saat idle (di luar jendela TBT); dijalankan ulang tiap navigasi (pathname).
 * Reduced motion → tidak melakukan apa pun (konten sudah final dari server).
 *
 * Satu mekanisme reveal untuk seluruh situs: menggantikan `.muncul-saat-gulir` (CSS
 * scroll-driven, hanya Chromium, terikat posisi gulir) — alasan di docs/design.md §4.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { onIdle } from "@/lib/idle";

function formatter(el: HTMLElement) {
  const decimals = Number(el.dataset.decimals ?? "0");
  const nf = new Intl.NumberFormat(el.dataset.locale || "id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (n: number) => nf.format(Number(n.toFixed(decimals)));
}

export function ScrollEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let io: IntersectionObserver | undefined;
    const stops: (() => void)[] = [];

    const cancelIdle = onIdle(() => {
      const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;
      const reveals = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-state])")].filter(below);
      const tickers = [...document.querySelectorAll<HTMLElement>("[data-ticker]:not([data-ticker-state])")].filter(below);
      for (const el of reveals) el.dataset.revealState = "armed";
      for (const el of tickers) {
        el.dataset.tickerState = "armed";
        el.textContent = formatter(el)(Number(el.dataset.from ?? "0"));
      }
      if (reveals.length + tickers.length === 0) return;

      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            io?.unobserve(el);
            if (el.dataset.revealState === "armed") el.dataset.revealState = "in";
            if (el.dataset.tickerState === "armed") {
              el.dataset.tickerState = "running";
              const fmt = formatter(el);
              const from = Number(el.dataset.from ?? "0");
              const to = Number(el.dataset.to ?? "0");
              const delay = Number(el.dataset.delay ?? "0");
              void import("@/lib/motion-lazy").then(({ animate }) => {
                const controls = animate(from, to, {
                  type: "spring",
                  damping: 60,
                  stiffness: 100,
                  delay,
                  onUpdate: (v) => {
                    el.textContent = fmt(v);
                  },
                });
                stops.push(() => controls.stop());
              });
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      for (const el of [...reveals, ...tickers]) io.observe(el);
    });

    return () => {
      cancelIdle();
      io?.disconnect();
      for (const stop of stops) stop();
    };
  }, [pathname]);

  return null;
}
