import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * /robots.txt
 *
 * Seluruh situs boleh dirayapi: tujuan tunggal situs ini adalah ditemukan calon
 * klien, dan tidak ada halaman privat.
 *
 * KENAPA /api/ TETAP DI-DISALLOW. Bukan alasan keamanan — robots.txt itu berkas
 * publik yang bersifat imbauan, dan pengamanan /api/lead yang sebenarnya ada di
 * app/api/lead/route.ts (zod + honeypot + rate limit, lihat SECURITY.md).
 * Alasannya murni kebersihan hasil rayapan: satu-satunya endpoint yang ada,
 * POST /api/lead, membalas 405 untuk GET, jadi setiap kunjungan crawler ke sana
 * hanya menghasilkan error yang menumpuk di Search Console dan membuang jatah
 * rayapan. Ia juga tidak membocorkan apa pun: path /api/lead sudah terbit di
 * bundel klien halaman /kontak.
 *
 * Tidak ada Disallow untuk /_next/ — mesin pencari perlu memuat JS & CSS untuk
 * merender halaman; memblokirnya justru merusak penilaian mobile-friendly.
 *
 * Alamat sitemap dibentuk dari `site.domain` (content/site.ts), sumber yang sama
 * dengan metadataBase, canonical, dan og:url. Selama domainnya masih
 * "http://localhost:3000" (sementara sampai W3-04), baris Sitemap di bawah ikut
 * menunjuk localhost — jujur, dan otomatis benar begitu domain aslinya diisi.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: new URL("/sitemap.xml", site.domain).href,
  };
}
