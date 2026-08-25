/**
 * Barrel komponen section — impor dari sini:
 * `import { HalamanProduk, metadataProduk } from "@/components/sections";`
 *
 * Komponen di folder ini sengaja TIDAK menyimpan teks apa pun. Semua string datang
 * dari `@/content/copy` (copy) dan `@/content/site` (nama paket, harga, pesan
 * WhatsApp), dan props-nya memakai tipe dari kedua modul itu tanpa menduplikasinya.
 * Tujuannya supaya blok yang sama bisa dipakai ulang /pricing, /tentang, dan
 * /studi-kasus pada item checklist berikutnya.
 *
 * ATURAN: barrel ini hanya boleh mengekspor komponen SERVER — juga tidak boleh
 * mengekspor komponen server yang MENGIMPOR komponen `"use client"`.
 *
 * Barrel ini diimpor /pricing, /tentang, ketiga /produk/*, dan 404. Satu ekspor yang
 * menyentuh batas klien membuat chunk klien itu ikut dimuat di SEMUA rute tersebut,
 * walau tak satu pun merendernya. Terukur pada W2-05: mengekspor `HalamanKontak`
 * (yang mengimpor client `FormKontak`) menambah satu <script src> ke chunk 5.885 B
 * berisi logika honeypot dan `fetch("/api/lead")` di enam rute yang tidak punya form
 * — 7 → 8 <script src> per halaman. Jangan mengandalkan tree-shaking untuk
 * membuangnya: pada build produksi Next.js 16 + Turbopack ia terbukti TIDAK terjadi.
 *
 * Karena itu `FormKontak` DAN `HalamanKontak` tidak ada di daftar bawah. Halaman
 * /kontak mengimpor `HalamanKontak` langsung dari
 * `@/components/sections/halaman-kontak`. Komponen baru yang ber-`"use client"`,
 * atau yang mengimpor komponen ber-`"use client"`, ikut aturan yang sama: impor
 * langsung dari berkasnya, jangan ditambahkan ke sini.
 */

export { BlokCtaPenutup } from "./blok-cta-penutup";
export { BlokParagraf } from "./blok-paragraf";
export { BlokSectionTambahan } from "./section-tambahan";
export { DaftarBukti } from "./daftar-bukti";
export { DaftarFaq } from "./daftar-faq";
export { DaftarLangkah } from "./daftar-langkah";
export { DaftarMesin } from "./daftar-mesin";
export { DaftarPaket } from "./daftar-paket";
export { DaftarPoin } from "./daftar-poin";
export { DaftarTanda } from "./daftar-tanda";
export { HalamanPricing } from "./halaman-pricing";
export { HalamanProduk } from "./halaman-produk";
export { HalamanTentang } from "./halaman-tentang";
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
