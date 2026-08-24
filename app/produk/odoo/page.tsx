import type { Metadata } from "next";
import { HalamanProduk, metadataProduk } from "@/components/sections";
import { odoo } from "@/content/copy";

/**
 * /produk/odoo
 *
 * Copy: content/copy/odoo.ts · harga & paket: produk[] di content/site.ts.
 * Struktur section-nya bersama di <HalamanProduk> (components/sections).
 */
export const metadata: Metadata = metadataProduk(odoo);

export default function HalamanOdoo() {
  return <HalamanProduk copy={odoo} />;
}
