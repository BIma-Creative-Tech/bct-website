import type { Metadata } from "next";
import type { ProdukCopy } from "@/content/copy";
import { site } from "@/content/site";

/**
 * Metadata ketiga halaman /produk/*, disusun sekali di sini supaya tiap page.tsx
 * tetap tipis dan polanya tidak menyimpang antar halaman.
 *
 * `title` sengaja TANPA sufiks merek: app/produk/<slug> adalah segmen ANAK dari
 * app/layout.tsx, jadi `title.template` ("%s — <nama merek>") di layout itu yang
 * menambahkan sufiks. Menulis sufiks di sini akan membuatnya dobel. (Beranda
 * memakai `title.absolute` justru karena ia satu segmen dengan layout.)
 *
 * `openGraph.title` TIDAK ikut template judul: di Next 16 template Open Graph hanya
 * berasal dari `openGraph.title.template` milik segmen induk, dan root layout tidak
 * mendefinisikan `openGraph` sama sekali. Karena itu sufiks disusun eksplisit di
 * sini supaya og:title identik dengan <title> — diverifikasi pada HTML hasil build.
 *
 * `openGraph.images` sengaja dikosongkan: berkas OG belum ada (menyusul di W3-01),
 * dan menunjuk path yang belum ada lebih buruk daripada tidak punya gambar.
 */
export function metadataProduk(copy: ProdukCopy): Metadata {
  const url = `/produk/${copy.slug}`;

  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${copy.meta.title} — ${site.name}`,
      description: copy.meta.description,
      type: "website",
      locale: "id_ID",
      url,
      siteName: site.name,
    },
  };
}
