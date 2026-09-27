import { BlobLatar } from "@/components/blob-latar";
import { Eyebrow } from "@/components/eyebrow";
import { LinkButton } from "@/components/link-button";
import { kelas, wadah } from "@/components/styles";
import { WaButton } from "@/components/wa-button";
import type { BlokCta } from "@/content/copy";
import { tautanHidup } from "@/content/rute";
import { kelasBarisTombol, kelasJudulSection, kelasParagrafSection } from "./kelas-section";
import { propsReveal } from "@/components/reveal";

/**
 * Blok CTA penutup halaman — tujuan tunggal situs ini: memulai chat WhatsApp
 * (lihat CLAUDE.md). Tombolnya lewat <WaButton>, jadi nomor WA tetap hanya ada
 * di content/site.ts.
 *
 * TAUTAN SEKUNDER (W2-12): dilewatkan `tautanHidup()` dari content/rute.ts, jadi
 * tombol kedua hanya tayang bila rutenya sudah ada. Semua halaman yang memakai
 * blok ini (/pricing, /tentang, /kontak, ketiga /produk/*) ikut aturannya tanpa
 * perlu penjagaan sendiri — mis. `odoo.penutup.sekunder` -> /studi-kasus menyala
 * otomatis begitu W2-03 mendaftarkan rutenya. Copy-nya tidak diubah.
 */
export function BlokCtaPenutup({ cta, idJudul }: { cta: BlokCta; idJudul: string }) {
  const sekunder = tautanHidup(cta.sekunder);

  return (
    <section aria-labelledby={idJudul} className={kelas(wadah, "py-16 sm:py-24")}>
      <div {...propsReveal()} className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface">
        {/* Blob aksen berdenyut di latar kartu (pola referensi v0, G-29). */}
        <BlobLatar posisi="kanan-atas" />
        {/* Pita gradien di tepi atas kartu — dekoratif, teks tetap di latar surface. */}
        <div aria-hidden="true" className="h-1.5 bg-gradien" />
        <div className="p-8 sm:p-12">
          <Eyebrow>{cta.eyebrow}</Eyebrow>
          <h2 id={idJudul} className={kelasJudulSection}>
            {cta.judul}
          </h2>
          <p className={kelasParagrafSection}>{cta.teks}</p>
          <div className={kelasBarisTombol}>
            <WaButton pesan={cta.primer.pesan} panah>
              {cta.primer.label}
            </WaButton>
            {sekunder ? <LinkButton href={sekunder.href}>{sekunder.label}</LinkButton> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
