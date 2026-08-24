import type { Metadata } from "next";
import { HalamanProduk, metadataProduk } from "@/components/sections";
import { bimaInsight } from "@/content/copy";

/**
 * /produk/bima-insight
 *
 * Rute literal (bukan /produk/[slug]) supaya tiap produk bisa diberi perlakuan
 * sendiri kelak tanpa membongkar rute. Seluruh struktur section tinggal di
 * <HalamanProduk>, jadi halaman ini hanya memilih copy dan menyusun metadata.
 *
 * Copy: content/copy/bima-insight.ts · harga & paket: produk[] di content/site.ts.
 */
export const metadata: Metadata = metadataProduk(bimaInsight);

export default function HalamanBimaInsight() {
  return <HalamanProduk copy={bimaInsight} />;
}
