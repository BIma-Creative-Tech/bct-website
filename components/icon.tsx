/**
 * Wrapper bertipe untuk web component resmi Iconsax (`iconsax@0.1.1`, MIT) — port
 * web-starter `src/components/icon.tsx` (`cn` diganti `kelas` dari components/styles.ts).
 * Bukan client component (tanpa hook) → tidak menambah JS hydration; bisa dipakai di server
 * maupun client component, dan boleh diekspor lewat barrel components/sections.
 *
 * Nama ikon dirender sebagai `data-name` (bukan `name`): <IconsaxLoader> (root layout) saat idle
 * mendaftarkan subset ikon GRATIS via `registerProIcons()` lalu menyalin `data-name` → `name`.
 * Atribut `pro` = ambil SVG dari registry lokal, BUKAN ikon berbayar. Jangan jalankan
 * `npx iconsax sync`. Ukuran dipesan lewat wrapper ber-dimensi tetap → tidak ada layout shift.
 * Warna default `currentColor` → ikut token (text-accent, text-ink-2, `.tema-gelap`, dark mode).
 */
import type { IconName, IconStyle } from "@/components/icon-names";
import { kelas } from "@/components/styles";

export type { IconName, IconStyle } from "@/components/icon-names";

type IconProps = {
  name: IconName;
  type?: IconStyle;
  size?: number;
  /** Default mengikuti warna teks (currentColor). */
  color?: string;
  /** Isi bila ikon bermakna (tanpa teks pendamping); kosong = dekoratif (aria-hidden). */
  label?: string;
  className?: string;
};

export function Icon({ name, type = "linear", size = 24, color = "currentColor", label, className }: IconProps) {
  return (
    <span
      className={kelas("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <iconsax-icon pro="" data-name={name} type={type} size={String(size)} color={color} />
    </span>
  );
}
