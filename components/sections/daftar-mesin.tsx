import type { MesinBisnis } from "@/content/copy";

/**
 * Tiga "mesin bisnis" BCT (/tentang) — daftar bernomor.
 *
 * TIDAK memakai <DaftarLangkah> walau tampilannya bersaudara: tipe `MesinBisnis`
 * memakai field `nama` (bukan `judul`), jadi memaksakannya berarti membangun objek
 * `Langkah` palsu di tempat pemanggilan — dan sebuah mesin bisnis bukan langkah
 * berurutan. Selain itu jumlahnya tiga, sehingga grid-nya 3 kolom, bukan 2.
 *
 * Nomor datang dari copy, bukan dari index array. Semua teks dari content/copy.
 */
export function DaftarMesin({ item }: { item: MesinBisnis[] }) {
  return (
    <ol className="mt-10 grid gap-8 md:grid-cols-3">
      {item.map((mesin) => (
        <li key={mesin.nomor} className="border-t border-line pt-5">
          <span className="font-mono text-sm font-semibold tracking-[0.14em] text-accent">
            {mesin.nomor}
          </span>
          <h3 className="mt-3 font-display text-lg font-bold text-ink">{mesin.nama}</h3>
          <p className="mt-2 max-w-[65ch] text-sm text-ink-2">{mesin.teks}</p>
        </li>
      ))}
    </ol>
  );
}
