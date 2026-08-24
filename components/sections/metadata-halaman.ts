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
 * `openGraph.images` sengaja dikosongkan: berkas OG belum ada (menyusul di W3-01),
 * dan menunjuk path yang belum ada lebih buruk daripada tidak punya gambar.
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
