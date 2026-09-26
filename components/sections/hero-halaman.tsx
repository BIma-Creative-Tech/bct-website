import { BlobLatar } from "@/components/blob-latar";
import { HeroAnimator } from "@/components/hero-animator";
import { Eyebrow } from "@/components/eyebrow";
import { LinkButton } from "@/components/link-button";
import { kelas, wadah } from "@/components/styles";
import { AnimatedGridPattern } from "@/components/ui-21st/animated-grid-pattern";
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
    // Latar: blob aksen + grid "engineering" (21st.dev Animated Grid Pattern, G-39) — grid
    // statis di < 768px, kotak berkedip (CSS opacity) hanya md+ dan tanpa reduced motion.
    // Intro: <HeroAnimator> (anime.js WAAPI, saat idle) memberi gerak angkat bertahap pada
    // baris `data-hero-init="lift"`; teks TIDAK pernah disembunyikan (LCP tidak menunggu JS).
    // `relative isolate` agar latar -z-10 tetap di belakang isi.
    <section aria-labelledby={idJudul} className="relative isolate overflow-hidden">
      <BlobLatar />
      <AnimatedGridPattern
        numSquares={18}
        maxOpacity={0.12}
        duration={3}
        animateMedia="(min-width: 768px)"
        className="-z-10 opacity-60 mask-[radial-gradient(560px_circle_at_85%_20%,white,transparent)]"
      />
      <HeroAnimator className={kelas(wadah, "py-16 sm:py-24")}>
        <div data-hero-init="lift">
          <Eyebrow>{eyebrow ?? hero.eyebrow}</Eyebrow>
        </div>
        <h1 id={idJudul} data-hero-init="lift" className="mt-6 max-w-[20ch] text-4xl font-extrabold sm:text-5xl lg:text-6xl">
          {hero.judul}
        </h1>
        <p data-hero-init="lift" className="mt-6 max-w-[65ch] text-lg text-ink-2">
          {hero.teks}
        </p>
        {catatan ? (
          <p
            data-hero-init="lift"
            className="mt-8 max-w-[65ch] rounded-xl border border-line bg-accent-soft px-5 py-4 text-sm text-ink-2"
          >
            {catatan}
          </p>
        ) : null}
        <div data-hero-init="lift" className={kelasBarisTombol}>
          <WaButton pesan={hero.primer.pesan} panah>
            {hero.primer.label}
          </WaButton>
          {sekunder ? <LinkButton href={sekunder.href}>{sekunder.label}</LinkButton> : null}
        </div>
        {/* Pita gradien penutup hero — dekoratif, bukan latar teks. */}
        <div aria-hidden="true" className="mt-12 h-1.5 rounded-full bg-gradien sm:mt-16" />
      </HeroAnimator>
    </section>
  );
}
