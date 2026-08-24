import { Eyebrow } from "@/components/eyebrow";
import { LinkButton } from "@/components/link-button";
import { kelas, wadah } from "@/components/styles";
import { WaButton } from "@/components/wa-button";
import type { BlokCta } from "@/content/copy";
import { kelasBarisTombol, kelasJudulSection, kelasParagrafSection } from "./kelas-section";

/**
 * Blok CTA penutup halaman — tujuan tunggal situs ini: memulai chat WhatsApp
 * (lihat CLAUDE.md). Tombolnya lewat <WaButton>, jadi nomor WA tetap hanya ada
 * di content/site.ts.
 */
export function BlokCtaPenutup({ cta, idJudul }: { cta: BlokCta; idJudul: string }) {
  return (
    <section aria-labelledby={idJudul} className={kelas(wadah, "py-16 sm:py-24")}>
      <div className="rounded-3xl border border-line bg-surface p-8 sm:p-12">
        <Eyebrow>{cta.eyebrow}</Eyebrow>
        <h2 id={idJudul} className={kelasJudulSection}>
          {cta.judul}
        </h2>
        <p className={kelasParagrafSection}>{cta.teks}</p>
        <div className={kelasBarisTombol}>
          <WaButton pesan={cta.primer.pesan}>{cta.primer.label}</WaButton>
          {cta.sekunder ? (
            <LinkButton href={cta.sekunder.href}>{cta.sekunder.label}</LinkButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
