/**
 * Kelas Tailwind bersama untuk section halaman dalam (produk, pricing, tentang,
 * studi kasus). Nilainya sengaja disamakan dengan yang dipakai app/page.tsx supaya
 * ritme visual seluruh situs identik.
 *
 * ATURAN: hanya token dari app/globals.css (bg, surface, surface-2, ink, ink-2,
 * muted, line, accent, accent-soft). Tidak ada warna literal dan tidak ada varian
 * `dark:` — dark mode ditangani variabel CSS.
 */

/** Judul <h2> section. `text-wrap: balance` sudah global untuk h1–h3. */
export const kelasJudulSection =
  "mt-5 max-w-[22ch] font-display text-3xl font-extrabold sm:text-4xl";

/** Paragraf pengantar section. Body dibatasi ±65ch (aturan kerja no.1 CLAUDE.md). */
export const kelasParagrafSection = "mt-4 max-w-[65ch] text-ink-2";

/** Baris tombol CTA: menumpuk di mobile, sejajar mulai sm. */
export const kelasBarisTombol =
  "mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center";

/** Kartu netral di atas latar halaman. */
export const kelasKartu = "rounded-2xl border border-line bg-surface p-6";
