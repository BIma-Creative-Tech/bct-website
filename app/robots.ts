import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site";

// SITE_URL dibaca saat request (bukan saat build) → satu image untuk semua host.
export const dynamic = "force-dynamic";

/**
 * /robots.txt
 *
 * Staging/localhost (host berlabel `staging` atau loopback, lihat lib/site.ts): seluruh
 * situs `Disallow: /` — pola web-starter, pasangan `noindex` di app/layout.tsx.
 *
 * Production: seluruh situs boleh dirayapi — tujuan tunggal situs ini adalah ditemukan
 * calon klien, dan tidak ada halaman privat.
 *
 * KENAPA /api/ TETAP DI-DISALLOW. Bukan alasan keamanan — robots.txt itu berkas
 * publik yang bersifat imbauan, dan pengamanan /api/lead yang sebenarnya ada di
 * app/api/lead/route.ts (zod + honeypot + rate limit, lihat SECURITY.md).
 * Alasannya murni kebersihan hasil rayapan: POST /api/lead membalas 405 untuk GET,
 * dan /api/health hanya untuk healthcheck container.
 *
 * Tidak ada Disallow untuk /_next/ — mesin pencari perlu memuat JS & CSS untuk
 * merender halaman; memblokirnya justru merusak penilaian mobile-friendly.
 *
 * Alamat sitemap dibentuk dari env `SITE_URL`, sumber yang sama dengan metadataBase,
 * canonical, dan og:url.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  if (!isIndexable(base)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
