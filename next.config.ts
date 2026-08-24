import type { NextConfig } from "next";

/**
 * Security headers — diaudit oleh agent security-auditor.
 * CSP mengizinkan self + Umami (analytics self-host). Jangan dilonggarkan
 * tanpa justifikasi tertulis di PR dan persetujuan owner.
 */
const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC
  ? new URL(process.env.NEXT_PUBLIC_UMAMI_SRC).origin
  : "";

/**
 * Dev-only: React error overlay & Fast Refresh menyusun ulang callstack lewat
 * eval(), jadi tanpa 'unsafe-eval' overlay dan stack trace pincang saat debugging.
 * Cabang ini fail-closed: hanya aktif bila NODE_ENV persis "development".
 *
 * Catatan operasional (bukan garansi struktural):
 * - Nilai CSP ini dibakar saat build ke .next/routes-manifest.json. Yang menentukan
 *   header produksi adalah NODE_ENV pada saat BUILD, bukan saat request.
 * - Next hanya mengisi NODE_ENV="production" sebagai fallback ketika variabelnya
 *   kosong; NODE_ENV yang sudah diset tidak dipaksa ditimpa, dan flag seperti
 *   `next build --debug-prerender` justru menyetelnya ke "development".
 * - Karena itu: jangan pernah membangun artefak yang akan di-deploy dengan
 *   NODE_ENV=development atau --debug-prerender — 'unsafe-eval' ikut terbakar ke
 *   manifest dan header produksi jadi longgar tanpa terlihat di kode ini.
 * - Saat ini stage `build` di Dockerfile (baris 11-15) tidak men-set NODE_ENV.
 */
const devUnsafeEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${devUnsafeEval} ${umamiSrc}`.trim(),
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${umamiSrc}`.trim(),
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // untuk image Docker yang ramping
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
