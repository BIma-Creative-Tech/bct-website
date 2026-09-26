import { kartuInteraktif, kelas, nomorBesar } from "@/components/styles";
import type { Langkah } from "@/content/copy";
import { propsReveal } from "@/components/reveal";

/**
 * Langkah bernomor (section "cara kerja"). Nomornya datang dari copy, bukan dari index.
 *
 * Kartu proses bergaya referensi v0 (G-29): nomor besar bergradien di pojok
 * (dekoratif, `aria-hidden` — urutan sudah disampaikan <ol>), terangkat saat hover,
 * muncul saat digulir. Latar `bg-surface`; di atas pita surface border-nya yang
 * memisahkan kartu dari latar.
 */
export function DaftarLangkah({ langkah }: { langkah: Langkah[] }) {
  return (
    <ol className="mt-10 grid gap-4 sm:grid-cols-2">
      {langkah.map((item, i) => (
        <li
          key={item.nomor}
          {...propsReveal(i)}
          className={kelas(
            "group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 pt-16",
            kartuInteraktif,
          )}
        >
          <span aria-hidden="true" className={nomorBesar}>
            {item.nomor}
          </span>
          <h3 className="relative max-w-[18ch] font-display text-xl font-bold text-ink group-hover:text-accent motion-safe:transition-colors">
            {item.judul}
          </h3>
          <p className="relative mt-3 max-w-[65ch] text-sm text-ink-2">{item.teks}</p>
        </li>
      ))}
    </ol>
  );
}
