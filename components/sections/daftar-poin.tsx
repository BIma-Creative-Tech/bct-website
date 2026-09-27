import { kartuInteraktif, kelas } from "@/components/styles";
import type { Poin } from "@/content/copy";
import { propsReveal } from "@/components/reveal";

/**
 * Daftar butir "judul + penjelasan" (tipe `Poin` dari content/copy).
 * Dipakai section masalah dan section tambahan yang memakai `poin[]`.
 * Judul butir = <h3>, jadi komponen ini selalu dipasang di bawah <h2> section.
 */
export function DaftarPoin({ poin }: { poin: Poin[] }) {
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2">
      {poin.map((item, i) => (
        <li
          key={item.judul}
          {...propsReveal(i)}
          className={kelas("group rounded-2xl border border-line bg-surface p-6", kartuInteraktif)}
        >
          <h3 className="font-display text-lg font-bold text-ink group-hover:text-accent motion-safe:transition-colors">
            {item.judul}
          </h3>
          <p className="mt-3 max-w-[65ch] text-sm text-ink-2">{item.teks}</p>
        </li>
      ))}
    </ul>
  );
}
