import type { Metadata } from "next";
import { HalamanProduk, metadataProduk } from "@/components/sections";
import { odoo } from "@/content/copy";

/**
 * /produk/odoo
 *
 * Copy: content/copy/odoo.ts · harga & paket: produk[] di content/site.ts.
 * Struktur section-nya bersama di <HalamanProduk> (components/sections).
 *
 * `odoo.penutup.sekunder` ("Lihat studi kasus" -> /studi-kasus) tidak tayang selama
 * rutenya belum terdaftar hidup di content/rute.ts (W2-12). Penyaringnya ada di
 * <BlokCtaPenutup>, jadi berkas ini tidak perlu penjagaan sendiri dan copy-nya
 * tetap utuh — lihat komentar di components/sections/blok-cta-penutup.tsx.
 */
export const metadata: Metadata = metadataProduk(odoo);

export default function HalamanOdoo() {
  return <HalamanProduk copy={odoo} />;
}
