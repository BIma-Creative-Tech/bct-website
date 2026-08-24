import type { Metadata } from "next";
import type { ProdukCopy } from "@/content/copy";
import { metadataHalaman } from "./metadata-halaman";

/**
 * Metadata ketiga halaman /produk/*, disusun sekali di sini supaya tiap page.tsx
 * tetap tipis dan polanya tidak menyimpang antar halaman.
 *
 * Isi metadatanya (aturan sufiks judul, og:title, canonical, OG image) ditangani
 * `metadataHalaman()` yang dipakai bersama seluruh halaman dalam — baca komentar
 * lengkapnya di components/sections/metadata-halaman.ts.
 *
 * Yang khas produk hanya dua hal: path rute dibentuk dari `copy.slug` (sehingga
 * canonical dan og:url tidak mungkin melenceng dari rutenya), dan `copy` bertipe
 * `ProdukCopy` sehingga halaman produk tidak bisa salah mengirim copy halaman lain.
 */
export function metadataProduk(copy: ProdukCopy): Metadata {
  return metadataHalaman(copy.meta, `/produk/${copy.slug}`);
}
