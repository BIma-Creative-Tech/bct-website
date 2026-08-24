/**
 * Barrel komponen section — impor dari sini:
 * `import { HalamanProduk, metadataProduk } from "@/components/sections";`
 *
 * Komponen di folder ini sengaja TIDAK menyimpan teks apa pun. Semua string datang
 * dari `@/content/copy` (copy) dan `@/content/site` (nama paket, harga, pesan
 * WhatsApp), dan props-nya memakai tipe dari kedua modul itu tanpa menduplikasinya.
 * Tujuannya supaya blok yang sama bisa dipakai ulang /pricing, /tentang, dan
 * /studi-kasus pada item checklist berikutnya.
 */

export { BlokCtaPenutup } from "./blok-cta-penutup";
export { BlokSectionTambahan } from "./section-tambahan";
export { DaftarFaq } from "./daftar-faq";
export { DaftarLangkah } from "./daftar-langkah";
export { DaftarPaket } from "./daftar-paket";
export { DaftarPoin } from "./daftar-poin";
export { DaftarTanda } from "./daftar-tanda";
export { HalamanPricing } from "./halaman-pricing";
export { HalamanProduk } from "./halaman-produk";
export { HeroHalaman } from "./hero-halaman";
export { KepalaSection } from "./kepala-section";
export { KolomUntukSiapa } from "./kolom-untuk-siapa";
export { PaketPerProduk } from "./paket-per-produk";
export { SectionHalaman } from "./section-halaman";
export { metadataHalaman } from "./metadata-halaman";
export { metadataProduk } from "./metadata-produk";
export {
  kelasBarisTombol,
  kelasJudulSection,
  kelasKartu,
  kelasParagrafSection,
} from "./kelas-section";
