import { waMengambang } from "@/content/copy";
import { waLink } from "@/content/site";
import { Icon } from "./icon";
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
      <Icon name="messages-2" size={20} />
      {/* Label disembunyikan di layar sempit agar tidak menutupi konten; nama
          tombol untuk pembaca layar tetap dari aria-label di atas. */}
      <span className="hidden sm:inline">{waMengambang.label}</span>
    </a>
  );
}
