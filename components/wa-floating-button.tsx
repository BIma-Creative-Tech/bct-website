import { waMengambang } from "@/content/copy";
import { waLink } from "@/content/site";
import { fokusRing, kelas } from "./styles";

/**
 * Tombol WhatsApp mengambang (muncul di semua halaman).
 *
 * - Nomor WA hanya lewat waLink(); teks & aria-label dari content/copy/umum.ts.
 * - Target sentuh 56×56 px (> 44 px minimum WCAG 2.5.8).
 * - Safe area: jarak dari tepi = max(1.25rem, inset area) supaya tidak tertutup
 *   home indicator / sudut layar melengkung.
 * - z-index 30 → di bawah header (z-40) agar panel menu mobile tetap menutupinya.
 * - Tanpa animasi masuk/keluar; hanya transisi warna yang dibungkus `motion-safe:`
 *   sehingga otomatis mati saat prefers-reduced-motion: reduce.
 */
export function WaFloatingButton() {
  return (
    <a
      href={waLink(waMengambang.pesan)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={waMengambang.ariaLabel}
      className={kelas(
        "fixed right-[max(1.25rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30",
        "inline-flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full",
        "border border-accent bg-accent px-4 text-sm font-semibold text-bg",
        "hover:bg-ink hover:border-ink motion-safe:transition-colors",
        fokusRing,
      )}
    >
      <IkonPercakapan />
      {/* Label disembunyikan di layar sempit agar tidak menutupi konten; nama
          tombol untuk pembaca layar tetap dari aria-label di atas. */}
      <span className="hidden sm:inline">{waMengambang.label}</span>
    </a>
  );
}

/**
 * Ikon percakapan — inline SVG buatan sendiri (tanpa aset/CDN eksternal dan tanpa
 * warna di luar token; mewarisi currentColor).
 */
function IkonPercakapan() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />
      <path d="M9 11h6" />
      <path d="M9 14.5h3.5" />
    </svg>
  );
}
