import type { Metadata } from "next";
import type { MetaCopy } from "@/content/copy";
import { site } from "@/content/site";

/**
 * Metadata standar satu halaman dalam (segmen ANAK dari app/layout.tsx).
 * Dipakai /produk/* lewat `metadataProduk()` dan /pricing langsung; halaman W2
 * berikutnya (/studi-kasus, /tentang, /kontak) tinggal memanggilnya juga.
 *
 * `title` sengaja TANPA sufiks merek: `title.template` ("%s — <nama merek>") di
 * app/layout.tsx yang menambahkannya untuk segmen anak. Menulis sufiks di sini
 * membuatnya dobel. (Beranda memakai `title.absolute` justru karena ia satu segmen
 * dengan layout.)
 *
 * `openGraph.title` TIDAK ikut template judul: di Next 16 template Open Graph hanya
 * berasal dari `openGraph.title.template` milik segmen induk, dan root layout tidak
 * mendefinisikan `openGraph` sama sekali. Karena itu sufiks disusun eksplisit di
 * sini supaya og:title identik dengan <title> — diverifikasi pada HTML hasil build.
 * (ADR 2026-08-24 di docs/decisions.md.)
 *
 * `openGraph.images` HARUS TETAP TIDAK DISETEL DI SINI — bukan kelalaian, dan bukan
 * berarti halaman tanpa gambar. Sejak W3-01 tiap segmen rute punya berkas
 * `opengraph-image.tsx` sendiri (kartunya di components/og/kartu-og.tsx), dan Next
 * baru menambahkan gambar berkas itu ke metadata bila segmen tersebut TIDAK punya
 * key `openGraph.images`: lihat syarat `!source.openGraph.hasOwnProperty('images')`
 * pada `mergeStaticMetadata` di node_modules/next/dist/lib/metadata/resolve-metadata.js:149.
 * Menuliskan `images` di sini — termasuk `images: []` — mematikan og:image di
 * SEMUA halaman yang memakai helper ini sekaligus.
 *
 * @param meta `meta` dari content/copy/<halaman>.ts
 * @param path path absolut halaman, mis. "/pricing" (dipakai canonical + og:url)
 */
export function metadataHalaman(meta: MetaCopy, path: string): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${meta.title} — ${site.name}`,
      description: meta.description,
      type: "website",
      locale: "id_ID",
      url: path,
      siteName: site.name,
    },
  };
}
