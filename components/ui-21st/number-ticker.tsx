/**
 * Number Ticker — 21st.dev: https://21st.dev/@dillionverma/components/number-ticker (license: MIT)
 * Author: Dillion Verma / Magic UI. Upstream source: magicuidesign/magicui
 * @ d7207e5692d14c00dceafa8488d6d01f197fa0e4 apps/www/registry/magicui/number-ticker.tsx (MIT).
 * Disalin dari web-starter `src/components/ui-21st/number-ticker.tsx` (2026-09-26, G-39). Adaptasi BCT: `cn` → `kelas` (tanpa clsx/tailwind-merge); locale default id-ID sudah sesuai.
 * Detail provenance & perubahan: COMPONENTS.md.
 *
 * Adaptasi: SERVER component — merender NILAI AKHIR (tanpa JS / crawler / reduced motion melihat
 * angka benar); angka animasi `aria-hidden` + teks `sr-only`; format locale brand (id-ID); warna
 * dari token. Animasi (spring yang SAMA dengan upstream: damping 60, stiffness 100, via `animate()`
 * Motion yang di-import dinamis) dijalankan oleh <ScrollEnhancer> saat angka masuk viewport —
 * tanpa hydration per angka (upstream: useMotionValue + useSpring di tiap instance).
 */
import { type ComponentPropsWithoutRef } from "react";
import { kelas } from "@/components/styles";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  /** Detik. */
  delay?: number;
  decimalPlaces?: number;
  locale?: string;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  locale = "id-ID",
  ...props
}: NumberTickerProps) {
  const from = direction === "down" ? value : startValue;
  const to = direction === "down" ? startValue : value;
  const text = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(to.toFixed(decimalPlaces))); // nilai akhir

  return (
    <>
      <span
        aria-hidden="true"
        data-ticker=""
        data-from={from}
        data-to={to}
        data-delay={delay}
        data-decimals={decimalPlaces}
        data-locale={locale}
        className={kelas("inline-block tracking-wider tabular-nums", className)}
        {...props}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
