import type { SlugProduk } from "../site";

/**
 * Tipe bersama untuk seluruh copy situs BCT.
 *
 * ATURAN UNTUK FRONTEND-BUILDER (jangan dilanggar):
 * 1. File di folder ini HANYA berisi teks. Tidak ada angka harga, nama paket,
 *    nomor WhatsApp, atau email — semuanya diambil dari `content/site.ts`.
 * 2. Semua tombol WhatsApp dirender dengan `waLink(cta.pesan)` dari `content/site.ts`.
 *    Field `pesan` di bawah adalah teks prefill saja, tanpa nomor.
 * 3. Daftar fitur & harga paket dirender langsung dari `produk[].paket` di
 *    `content/site.ts`. Copy di sini hanya menyediakan kepala section untuk blok itu.
 * 4. `meta.title` DITULIS TANPA SUFFIX. Suffix " — Bima Creative Tech" sudah
 *    dipasang oleh `template` di `app/layout.tsx`.
 * 5. Komentar `[TANYA-OWNER]` = fakta yang belum tersedia. JANGAN pernah
 *    dirender sebagai teks yang dilihat pengunjung.
 * 6. Slug produk TIDAK ditulis ulang sebagai union literal di sini. Ia diimpor
 *    sebagai `SlugProduk` dari `content/site.ts` (import type saja — terhapus
 *    saat kompilasi, jadi nol dampak ke bundel). Union tulis tangan yang dulu ada
 *    di sini tidak terhubung ke sumber kebenaran: produk keempat bisa masuk ke
 *    `produk[]` tanpa copy dan build tetap hijau (terukur W2-10 butir b).
 */

/** Metadata halaman Next.js. `title` tanpa suffix, `description` <= 155 karakter. */
export type MetaCopy = {
  title: string;
  description: string;
};

/** Tombol yang membuka WhatsApp. Nomor WA diambil dari `waLink()` di content/site.ts. */
export type CtaWa = {
  label: string;
  /** Teks prefill WhatsApp — tanpa nomor, tanpa URL. */
  pesan: string;
};

/** Tombol yang menuju halaman internal. */
export type CtaTautan = {
  label: string;
  href: string;
};

/** Kepala section: eyebrow mono uppercase + judul + paragraf pengantar opsional. */
export type KepalaSection = {
  eyebrow: string;
  judul: string;
  teks?: string;
};

/** Butir dengan judul pendek + penjelasan satu-dua kalimat. */
export type Poin = {
  judul: string;
  teks: string;
};

/** Langkah bernomor untuk section "cara kerja". */
export type Langkah = {
  nomor: string;
  judul: string;
  teks: string;
};

export type Faq = {
  tanya: string;
  jawab: string;
};

/** Blok CTA penutup halaman. */
export type BlokCta = {
  eyebrow: string;
  judul: string;
  teks: string;
  primer: CtaWa;
  sekunder?: CtaTautan;
};

/** Hero halaman. */
export type HeroCopy = {
  /** Eyebrow pendek. Komponen boleh menambahkan `site.location` di belakangnya. */
  eyebrow: string;
  judul: string;
  teks: string;
  primer: CtaWa;
  sekunder?: CtaTautan;
};

/** Section "untuk siapa" — dua kolom: cocok dan belum cocok. */
export type UntukSiapa = {
  kepala: KepalaSection;
  labelCocok: string;
  cocok: string[];
  labelBelumCocok: string;
  belumCocok: string[];
};

/**
 * Section tambahan spesifik per produk (mis. keamanan data, retainer, custom dev).
 * `id` dipakai sebagai anchor/key React.
 */
export type SectionTambahan = {
  id: string;
  kepala: KepalaSection;
  poin?: Poin[];
  daftar?: string[];
};

/** Kerangka lengkap satu halaman produk. */
export type ProdukCopy = {
  /** Diturunkan dari `produk[]` di content/site.ts — lihat aturan 6 di atas. */
  slug: SlugProduk;
  meta: MetaCopy;
  hero: HeroCopy;
  /** Catatan status produk (mis. masih pengembangan). Kosongkan bila tidak relevan. */
  catatanStatus?: string;
  masalah: {
    kepala: KepalaSection;
    poin: Poin[];
  };
  caraKerja: {
    kepala: KepalaSection;
    langkah: Langkah[];
  };
  /** Section ekstra khas produk ini. Urutan render mengikuti urutan array. */
  tambahan?: SectionTambahan[];
  untukSiapa: UntukSiapa;
  /** Kepala untuk blok harga. Isi kartu paket dirender dari content/site.ts. */
  paket: KepalaSection;
  faq: {
    kepala: KepalaSection;
    item: Faq[];
  };
  penutup: BlokCta;
};
