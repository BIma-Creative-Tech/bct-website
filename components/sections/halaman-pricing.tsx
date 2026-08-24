import { kelas } from "@/components/styles";
import type { PricingCopy } from "@/content/copy";
import { BlokCtaPenutup } from "./blok-cta-penutup";
import { DaftarFaq } from "./daftar-faq";
import { DaftarPoin } from "./daftar-poin";
import { HeroHalaman } from "./hero-halaman";
import { kelasKartu } from "./kelas-section";
import { KepalaSection } from "./kepala-section";
import { PaketPerProduk } from "./paket-per-produk";
import { SectionHalaman } from "./section-halaman";

/**
 * Susunan lengkap halaman /pricing.
 *
 * Teks: `copy` (content/copy/pricing.ts) — dirender terhadap tipe `PricingCopy`,
 * bukan terhadap nilai literalnya. Angka harga, nama paket, dan pesan prefill
 * WhatsApp: `produk[]` di content/site.ts lewat <PaketPerProduk>. Tidak ada kalimat,
 * angka harga, atau nomor WhatsApp yang diketik di file ini.
 *
 * Urutan section mengikuti urutan field pada `PricingCopy`: hero > daftar paket >
 * kebijakan > catatan indikatif > FAQ > penutup. Latar `surface` dipasang berselang
 * agar irama visualnya sama dengan halaman produk.
 *
 * `copy.rateCardPdf` SENGAJA tidak dirender — alasannya di app/pricing/page.tsx (W2-11).
 */

const ID_JUDUL = {
  hero: "judul-utama",
  paket: "judul-paket",
  kebijakan: "judul-kebijakan",
  catatan: "judul-catatan-indikatif",
  faq: "judul-faq",
  penutup: "judul-penutup",
} as const;

export function HalamanPricing({ copy }: { copy: PricingCopy }) {
  return (
    <>
      <HeroHalaman hero={copy.hero} idJudul={ID_JUDUL.hero} />

      {/* Kartu paket sengaja di latar `bg`: isinya `bg-surface`, jadi di atas pita
          surface kartunya akan menyatu dengan latar. */}
      <SectionHalaman idJudul={ID_JUDUL.paket}>
        <KepalaSection kepala={copy.daftarPaket} idJudul={ID_JUDUL.paket} />
        {/* Label tombol diambil dari CTA penutup halaman ini — bukan teks baru karangan
            komponen; tipe `Paket` di content/site.ts tidak menyimpan label tombol. */}
        <PaketPerProduk labelCta={copy.penutup.primer.label} />
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.kebijakan} latar="surface">
        <KepalaSection kepala={copy.kebijakan.kepala} idJudul={ID_JUDUL.kebijakan} />
        <DaftarPoin poin={copy.kebijakan.poin} />
      </SectionHalaman>

      {/* Catatan indikatif: satu kartu, bukan grid — isinya peringatan tentang seluruh
          angka di atas, bukan salah satu butir kebijakan. Judulnya <h2> agar section ini
          punya nama aksesibel, tapi ukurannya ditahan supaya tidak menyaingi judul
          section sebenarnya. */}
      <SectionHalaman idJudul={ID_JUDUL.catatan}>
        <div className={kelas(kelasKartu, "sm:p-8")}>
          <h2 id={ID_JUDUL.catatan} className="font-display text-xl font-bold text-ink">
            {copy.catatanIndikatif.judul}
          </h2>
          <p className="mt-3 max-w-[65ch] text-sm text-ink-2">{copy.catatanIndikatif.teks}</p>
        </div>
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.faq} latar="surface">
        <KepalaSection kepala={copy.faq.kepala} idJudul={ID_JUDUL.faq} />
        <DaftarFaq item={copy.faq.item} />
      </SectionHalaman>

      <BlokCtaPenutup cta={copy.penutup} idJudul={ID_JUDUL.penutup} />
    </>
  );
}
