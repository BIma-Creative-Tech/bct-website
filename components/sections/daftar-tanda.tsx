import { Icon } from "@/components/icon";
import { kelas } from "@/components/styles";

/**
 * Daftar kalimat bertanda. Dipakai untuk `SectionTambahan.daftar`, fitur paket
 * (`produk[].paket[].fitur`), dan dua kolom "untuk siapa".
 *
 * `tanda="cocok"` memakai centang beraksen (Iconsax `tick-circle`); `tanda="belum"` memakai garis netral (`minus`) —
 * bukan tanda silang, karena isinya bukan kegagalan melainkan "belum sesuai".
 * Ikon murni dekoratif (aria-hidden), maknanya sudah ada di teks butir.
 */
export function DaftarTanda({
  item,
  tanda = "cocok",
  className,
}: {
  /** `readonly`: menerima `produk[].paket[].fitur` yang deeply readonly (`as const`). */
  item: readonly string[];
  tanda?: "cocok" | "belum";
  className?: string;
}) {
  return (
    <ul className={kelas("space-y-3", className)}>
      {item.map((teks) => (
        <li key={teks} className="flex gap-3">
          {tanda === "cocok" ? (
            <Icon name="tick-circle" size={18} className="mt-0.5 text-accent" />
          ) : (
            <Icon name="minus" size={18} className="mt-0.5 text-muted" />
          )}
          <span className="max-w-[65ch] text-sm text-ink-2">{teks}</span>
        </li>
      ))}
    </ul>
  );
}
