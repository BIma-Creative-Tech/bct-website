import { BlobLatar } from "@/components/blob-latar";
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
    // Blob latar + kemunculan bertahap (pola referensi v0, G-29); semua gerak
    // `motion-safe:`. `relative isolate` agar blob -z-10 tetap di belakang isi.
    <section aria-labelledby={idJudul} className="relative isolate overflow-hidden">
      <BlobLatar />
      <div className={kelas(wadah, "py-16 sm:py-24")}>
      <Eyebrow className="motion-safe:animate-muncul-naik">{eyebrow ?? hero.eyebrow}</Eyebrow>
      <h1
        id={idJudul}
        className="mt-6 max-w-[20ch] text-4xl font-extrabold sm:text-5xl lg:text-6xl motion-safe:animate-muncul-naik motion-safe:[animation-delay:100ms]"
      >
        {hero.judul}
      </h1>
      <p className="mt-6 max-w-[65ch] text-lg text-ink-2 motion-safe:animate-muncul-naik motion-safe:[animation-delay:200ms]">
        {hero.teks}
      </p>
      {catatan ? (
        <p className="mt-8 max-w-[65ch] rounded-xl border border-line bg-accent-soft px-5 py-4 text-sm text-ink-2 motion-safe:animate-muncul-naik motion-safe:[animation-delay:250ms]">
          {catatan}
        </p>
      ) : null}
      <div className={kelas(kelasBarisTombol, "motion-safe:animate-muncul-naik motion-safe:[animation-delay:300ms]")}>
        <WaButton pesan={hero.primer.pesan} panah>
          {hero.primer.label}
        </WaButton>
        {sekunder ? <LinkButton href={sekunder.href}>{sekunder.label}</LinkButton> : null}
      </div>
      {/* Pita gradien penutup hero — dekoratif, bukan latar teks. */}
      <div aria-hidden="true" className="mt-12 h-1.5 rounded-full bg-gradien sm:mt-16" />
      </div>
    </section>
  );
}
