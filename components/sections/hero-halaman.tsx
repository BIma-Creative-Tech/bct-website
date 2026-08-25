import { Eyebrow } from "@/components/eyebrow";
import { LinkButton } from "@/components/link-button";
import { kelas, wadah } from "@/components/styles";
import { WaButton } from "@/components/wa-button";
import type { HeroCopy } from "@/content/copy";
import { tautanHidup } from "@/content/rute";
import { kelasBarisTombol } from "./kelas-section";

/**
 * Hero halaman dalam: eyebrow + <h1> + paragraf + baris tombol.
 *
 * Halaman hanya boleh punya SATU <h1>, jadi komponen ini dipakai sekali per halaman.
 * `eyebrow` menerima string jadi (mis. hasil gabungan `hero.eyebrow` dengan
 * `produk[].nama` atau `site.location`) — komponen tidak menyusun teks sendiri.
 * `catatan` opsional untuk catatan status produk (mis. `catatanStatus` pada copy).
 *
 * TAUTAN SEKUNDER (W2-12): disaring `tautanHidup()` dari content/rute.ts — sama
 * seperti <BlokCtaPenutup>. Tombol kedua tidak pernah menuju rute yang belum ada.
 */
export function HeroHalaman({
  hero,
  idJudul,
  eyebrow,
  catatan,
}: {
  hero: HeroCopy;
  idJudul: string;
  /** Default: `hero.eyebrow`. Isi bila perlu digabung dengan data content/site.ts. */
  eyebrow?: string;
  catatan?: string;
}) {
  const sekunder = tautanHidup(hero.sekunder);

  return (
    <section aria-labelledby={idJudul} className={kelas(wadah, "py-16 sm:py-24")}>
      <Eyebrow>{eyebrow ?? hero.eyebrow}</Eyebrow>
      <h1 id={idJudul} className="mt-6 max-w-[20ch] text-4xl font-extrabold sm:text-5xl lg:text-6xl">
        {hero.judul}
      </h1>
      <p className="mt-6 max-w-[65ch] text-lg text-ink-2">{hero.teks}</p>
      {catatan ? (
        <p className="mt-8 max-w-[65ch] rounded-xl border border-line bg-accent-soft px-5 py-4 text-sm text-ink-2">
          {catatan}
        </p>
      ) : null}
      <div className={kelasBarisTombol}>
        <WaButton pesan={hero.primer.pesan}>{hero.primer.label}</WaButton>
        {sekunder ? <LinkButton href={sekunder.href}>{sekunder.label}</LinkButton> : null}
      </div>
    </section>
  );
}
