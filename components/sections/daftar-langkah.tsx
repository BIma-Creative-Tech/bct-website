import type { Langkah } from "@/content/copy";

/** Langkah bernomor (section "cara kerja"). Nomornya datang dari copy, bukan dari index. */
export function DaftarLangkah({ langkah }: { langkah: Langkah[] }) {
  return (
    <ol className="mt-10 grid gap-8 sm:grid-cols-2">
      {langkah.map((item) => (
        <li key={item.nomor} className="border-t border-line pt-5">
          <span className="font-mono text-sm font-semibold tracking-[0.14em] text-accent">
            {item.nomor}
          </span>
          <h3 className="mt-3 font-display text-xl font-bold text-ink">{item.judul}</h3>
          <p className="mt-2 max-w-[65ch] text-sm text-ink-2">{item.teks}</p>
        </li>
      ))}
    </ol>
  );
}
