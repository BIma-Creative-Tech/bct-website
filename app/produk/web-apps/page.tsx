import type { Metadata } from "next";
import { HalamanProduk, metadataProduk } from "@/components/sections";
import { webApps } from "@/content/copy";

/**
 * /produk/web-apps
 *
 * Copy: content/copy/web-apps.ts · harga & paket: produk[] di content/site.ts.
 * Struktur section-nya bersama di <HalamanProduk> (components/sections).
 */
export const metadata: Metadata = metadataProduk(webApps);

export default function HalamanWebApps() {
  return <HalamanProduk copy={webApps} />;
}
