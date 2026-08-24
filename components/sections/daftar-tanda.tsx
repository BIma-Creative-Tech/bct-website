import { kelas } from "@/components/styles";

/**
 * Daftar kalimat bertanda. Dipakai untuk `SectionTambahan.daftar`, fitur paket
 * (`produk[].paket[].fitur`), dan dua kolom "untuk siapa".
 *
 * `tanda="cocok"` memakai centang beraksen; `tanda="belum"` memakai garis netral —
 * bukan tanda silang, karena isinya bukan kegagalan melainkan "belum sesuai".
 * Ikon murni dekoratif (aria-hidden), maknanya sudah ada di teks butir.
 */
export function DaftarTanda({
  item,
  tanda = "cocok",
  className,
}: {
  item: string[];
  tanda?: "cocok" | "belum";
  className?: string;
}) {
  return (
    <ul className={kelas("space-y-3", className)}>
      {item.map((teks) => (
        <li key={teks} className="flex gap-3">
          {tanda === "cocok" ? <IkonCentang /> : <IkonGaris />}
          <span className="max-w-[65ch] text-sm text-ink-2">{teks}</span>
        </li>
      ))}
    </ul>
  );
}

function IkonCentang() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="mt-1 h-3.5 w-3.5 shrink-0 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

function IkonGaris() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="mt-1 h-3.5 w-3.5 shrink-0 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3.5 8h9" />
    </svg>
  );
}
