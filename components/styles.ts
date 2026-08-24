/**
 * Kelas Tailwind bersama untuk elemen interaktif dan wadah halaman.
 *
 * ATURAN: hanya token dari app/globals.css (bg, surface, surface-2, ink, ink-2,
 * muted, line, accent, accent-soft) dan font display/body/mono. Dilarang warna
 * literal (#hex, text-gray-*, bg-white, text-black) — dark mode ditangani otomatis
 * oleh variabel CSS, jadi tidak perlu varian `dark:`.
 */

/** Focus ring wajib untuk SEMUA elemen interaktif. Terlihat di light & dark. */
export const fokusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Dasar tombol: tinggi minimal 44px (target sentuh WCAG 2.5.8) dan transisi
 * warna yang hanya aktif bila pengguna tidak meminta pengurangan gerak
 * (`motion-safe:` = @media (prefers-reduced-motion: no-preference)).
 */
const dasarTombol =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold motion-safe:transition-colors";

export const tombolPrimer = `${dasarTombol} bg-accent text-bg hover:bg-ink ${fokusRing}`;

export const tombolSekunder = `${dasarTombol} border border-line bg-surface text-ink hover:border-accent hover:text-accent ${fokusRing}`;

/** Tautan teks biasa (dalam paragraf / daftar). */
export const tautanTeks = `rounded-sm text-ink underline decoration-line underline-offset-4 hover:decoration-accent hover:text-accent motion-safe:transition-colors ${fokusRing}`;

/** Wadah horizontal standar situs. */
export const wadah = "mx-auto w-full max-w-5xl px-6";

/** Gabungkan kelas opsional tanpa dependensi tambahan. */
export function kelas(...nilai: Array<string | false | null | undefined>): string {
  return nilai.filter(Boolean).join(" ");
}
