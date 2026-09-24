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
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold motion-safe:transition motion-safe:duration-300";

/** Primer: bercahaya aksen dan sedikit terangkat saat hover (pola referensi v0, G-29). */
export const tombolPrimer = `${dasarTombol} bg-accent text-bg shadow-lg shadow-accent/25 hover:bg-ink hover:shadow-xl hover:shadow-accent/35 motion-safe:hover:-translate-y-0.5 ${fokusRing}`;

export const tombolSekunder = `${dasarTombol} border border-line bg-surface text-ink hover:border-accent hover:text-accent motion-safe:hover:-translate-y-0.5 ${fokusRing}`;

/**
 * Kartu interaktif: terangkat, bayangan beraksen, border aksen saat hover (G-29).
 * Tambahkan `group` di elemen yang sama bila isinya punya efek `group-hover:`.
 */
export const kartuInteraktif =
  "hover:border-accent hover:shadow-xl hover:shadow-accent/10 motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-1.5";

/**
 * Chip ikon kartu: lembut di keadaan diam, terisi aksen + membesar + miring sedikit
 * saat kartu induknya (`group`) di-hover.
 */
export const chipIkon =
  "inline-flex rounded-xl bg-accent-soft p-3 text-accent group-hover:bg-accent group-hover:text-bg motion-safe:transition motion-safe:duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-3";

/**
 * Nomor besar bergradien di pojok kartu proses/langkah (pola referensi v0, G-29).
 * Selalu `aria-hidden` — urutannya sudah disampaikan <ol>. Induk wajib `relative
 * overflow-hidden`, dan teks kartu diberi `relative` agar berada di atasnya.
 */
export const nomorBesar =
  "pointer-events-none absolute -top-3 right-3 select-none bg-gradien bg-clip-text font-display text-[72px] font-extrabold leading-none text-transparent opacity-30";

/** Panah dekoratif di ujung tombol; bergeser ke kanan saat tombol (`group`) di-hover. */
export const panahTombol = "motion-safe:transition-transform motion-safe:group-hover:translate-x-1";

/** Tautan teks biasa (dalam paragraf / daftar). */
export const tautanTeks = `rounded-sm text-ink underline decoration-line underline-offset-4 hover:decoration-accent hover:text-accent motion-safe:transition-colors ${fokusRing}`;

/** Wadah horizontal standar situs. */
export const wadah = "mx-auto w-full max-w-5xl px-6";

/** Gabungkan kelas opsional tanpa dependensi tambahan. */
export function kelas(...nilai: Array<string | false | null | undefined>): string {
  return nilai.filter(Boolean).join(" ");
}
