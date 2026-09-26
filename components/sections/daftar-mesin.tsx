import { kartuInteraktif, kelas, nomorBesar } from "@/components/styles";
import type { MesinBisnis } from "@/content/copy";
import { propsReveal } from "@/components/reveal";

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
  // Kartu bergaya proses referensi v0 (G-29), sama dengan <DaftarLangkah>. Latar
  // `bg` karena /tentang memasang section ini di pita surface.
  return (
    <ol className="mt-10 grid gap-4 md:grid-cols-3">
      {item.map((mesin, i) => (
        <li
          key={mesin.nomor}
          {...propsReveal(i)}
          className={kelas(
            "group relative overflow-hidden rounded-2xl border border-line bg-bg p-6 pt-16",
            kartuInteraktif,
          )}
        >
          <span aria-hidden="true" className={nomorBesar}>
            {mesin.nomor}
          </span>
          <h3 className="relative max-w-[16ch] font-display text-lg font-bold text-ink group-hover:text-accent motion-safe:transition-colors">
            {mesin.nama}
          </h3>
          <p className="relative mt-3 max-w-[65ch] text-sm text-ink-2">{mesin.teks}</p>
        </li>
      ))}
    </ol>
  );
}
