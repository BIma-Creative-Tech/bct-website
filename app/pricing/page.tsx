import type { Metadata } from "next";
import { HalamanPricing, metadataHalaman } from "@/components/sections";
import { pricing } from "@/content/copy";

/**
 * /pricing — rate card lengkap.
 *
 * Copy: content/copy/pricing.ts · harga & paket: produk[] di content/site.ts.
 * Struktur section-nya di <HalamanPricing> (components/sections/halaman-pricing.tsx).
 *
 * BLOK `pricing.rateCardPdf` SENGAJA TIDAK DIRENDER. Berkas PDF-nya belum ada di repo,
 * jadi merender tombolnya = tombol unduh yang menuju 404. Copy dan tipenya dibiarkan
 * utuh di content/copy/pricing.ts (bukan sampah — tinggal disambungkan begitu berkasnya
 * masuk). Dilacak sebagai W2-11 di docs/checklist.md: owner menyediakan berkasnya,
 * lalu blok ini diaktifkan sebelum rilis (bagian dari Definition of Done situs).
 */
export const metadata: Metadata = metadataHalaman(pricing.meta, "/pricing");

export default function HalamanRateCard() {
  return <HalamanPricing copy={pricing} />;
}
