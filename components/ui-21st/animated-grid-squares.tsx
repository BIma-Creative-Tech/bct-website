"use client";

/**
 * Bagian interaktif Animated Grid Pattern (21st.dev/Magic UI, MIT — lihat animated-grid-pattern.tsx
 * dan COMPONENTS.md): kotak berkedip. Pulau client terpisah agar garis grid tetap server-rendered.
 * Disalin dari web-starter `src/components/ui-21st/animated-grid-squares.tsx` (2026-09-26, G-39). Adaptasi BCT: path hook → `lib/use-motion-prefs.ts`; selebihnya identik.
 * Mulai saat idle (di luar jendela TBT), hanya bila `media` cocok dan tanpa reduced motion; jeda
 * saat di luar viewport. Animasi = CSS keyframes opacity (compositor); posisi acak baru diambil
 * saat siklus selesai (animationend), seperti upstream.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { onIdle } from "@/lib/idle";
import { useIsVisible, useMediaQuery, usePrefersReducedMotion } from "@/lib/use-motion-prefs";

type Square = { id: number; pos: [number, number]; iteration: number };

export function AnimatedGridSquares({
  width,
  height,
  x,
  y,
  numSquares,
  maxOpacity,
  duration,
  repeatDelay,
  media,
}: {
  width: number;
  height: number;
  x: number;
  y: number;
  numSquares: number;
  maxOpacity: number;
  duration: number;
  repeatDelay: number;
  media?: string;
}) {
  const mediaOk = useMediaQuery(media) === true;
  const active = usePrefersReducedMotion() === false && mediaOk;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useIsVisible(ref);
  const [idle, setIdle] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState<Array<Square>>([]);

  useEffect(() => (active ? onIdle(() => setIdle(true)) : undefined), [active]);

  const getPos = useCallback((): [number, number] => {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ];
  }, [dimensions.height, dimensions.width, height, width]);

  const updateSquarePosition = useCallback(
    (squareId: number) => {
      setSquares((currentSquares) => {
        const current = currentSquares[squareId];
        if (!current || current.id !== squareId) return currentSquares;
        const nextSquares = currentSquares.slice();
        nextSquares[squareId] = { ...current, pos: getPos(), iteration: current.iteration + 1 };
        return nextSquares;
      });
    },
    [getPos],
  );

  useEffect(() => {
    if (!active || !idle || !dimensions.width || !dimensions.height) return;
    // Posisi acak hanya di klien (setelah ukuran diketahui) → tidak ada hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSquares(Array.from({ length: numSquares }, (_, i) => ({ id: i, pos: getPos(), iteration: 0 })));
  }, [active, idle, dimensions.width, dimensions.height, getPos, numSquares]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !active || !idle) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions((cur) => {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          return cur.width === w && cur.height === h ? cur : { width: w, height: h };
        });
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [active, idle]);

  const cycle = duration * 2 + repeatDelay;

  return (
    <div ref={ref} className="absolute inset-0" style={{ opacity: maxOpacity, transform: `translate(${x}px, ${y}px)` }}>
      {active
        ? squares.map(({ pos: [squareX, squareY], id: squareId, iteration }, index) => (
            <span
              key={`${squareId}-${iteration}`}
              onAnimationEnd={() => updateSquarePosition(squareId)}
              className="animate-grid-square absolute bg-current opacity-0"
              style={{
                left: squareX * width + 1,
                top: squareY * height + 1,
                width: width - 1,
                height: height - 1,
                animationDuration: `${cycle}s`,
                animationDelay: iteration === 0 ? `${index * 0.1}s` : "0s",
                animationPlayState: inView ? "running" : "paused",
              }}
            />
          ))
        : null}
    </div>
  );
}
