/**
 * Barrel copy situs BCT — impor dari sini: `import { beranda } from "@/content/copy";`
 *
 * Isi folder ini HANYA teks. Data harga, nama paket, nomor WhatsApp, dan email tetap
 * berada di `content/site.ts` dan tidak boleh diduplikasi di sini.
 * Baca `content/copy/types.ts` untuk aturan render lengkap.
 */

import type { ProdukCopy } from "./types";
import { bimaInsight } from "./bima-insight";
import { odoo } from "./odoo";
import { webApps } from "./web-apps";

export type {
  BlokCta,
  CtaTautan,
  CtaWa,
  Faq,
  HeroCopy,
  KepalaSection,
  Langkah,
  MetaCopy,
  Poin,
  ProdukCopy,
  SectionTambahan,
  UntukSiapa,
} from "./types";

export { beranda } from "./beranda";
export type { BerandaCopy, BuktiDetail } from "./beranda";

export { bimaInsight, odoo, webApps };

export { pricing } from "./pricing";
export type { PricingCopy } from "./pricing";

export { tentang } from "./tentang";
export type { MesinBisnis, TentangCopy } from "./tentang";

export { studiKasus } from "./studi-kasus";
export type { KutipanKlien, StudiKasus, StudiKasusCopy } from "./studi-kasus";

export { kontak } from "./kontak";
export type { FormKontakCopy, JalurKontak, KontakCopy, OpsiProduk } from "./kontak";

export { footer, navCta, navProduk, navUtama, waMengambang } from "./umum";
export type { FooterCopy, GrupFooter, ItemNav, ItemNavProduk } from "./umum";

export { tidakDitemukan } from "./tidak-ditemukan";
export type { TidakDitemukanCopy } from "./tidak-ditemukan";

/**
 * Peta copy produk per slug. Slug-nya sama dengan `produk[].slug` di content/site.ts.
 *
 * BUKAN untuk rute dinamis: ADR 2026-08-24 (`docs/decisions.md`) memutuskan rute produk
 * dibuat sebagai tiga berkas literal — `app/produk/bima-insight/page.tsx`,
 * `app/produk/odoo/page.tsx`, `app/produk/web-apps/page.tsx` — yang mengimpor
 * `bimaInsight` / `odoo` / `webApps` langsung. Rute `/produk/[slug]` tidak pernah dibuat
 * dan tidak akan dibuat.
 *
 * STATUS: nol pemakai di seluruh repo per 2026-08-25 (dipertahankan, bukan terlupakan).
 * Peta ini baru berguna bila kelak ada halaman yang harus memilih copy produk dari slug
 * yang tidak diketahui saat menulis kode — misalnya daftar/pembanding produk, pencarian,
 * atau tautan produk yang datang dari data. Selama tiga rute literal itu bertahan,
 * konsumennya memang tidak ada.
 *
 * Hapus-atau-pertahankan = keputusan owner (dilacak sebagai W2-10 di `docs/checklist.md`),
 * karena menghapus ekspor publik berisiko memecah build.
 */
export const produkCopy: Record<ProdukCopy["slug"], ProdukCopy> = {
  "bima-insight": bimaInsight,
  odoo,
  "web-apps": webApps,
};
