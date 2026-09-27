import type { NextConfig } from "next";

/**
 * Header keamanan STATIS — diaudit oleh agent security-auditor. Pola web-starter
 * (referensi platform VPS, ADR 2026-09-26):
 *
 * - Content-Security-Policy TIDAK lagi di sini: CSP ber-nonce diset per request di
 *   `proxy.ts` (lib/csp.ts), tanpa 'unsafe-inline' di script-src (G-32). Traefik tidak
 *   menyetel CSP — aplikasi wajib mengirimnya sendiri.
 * - Strict-Transport-Security TIDAK di sini: HSTS milik Traefik (middleware
 *   `security-headers` platform, nilai & bertahapnya diputuskan di repo infra). Nilai lama
 *   aplikasi (`max-age=63072000; includeSubDomains; preload`) bertentangan dengan keputusan
 *   platform (includeSubdomains & preload = false) dan akan mengikat semua subdomain
 *   bimacreative.tech — alasan lengkap di ADR 2026-09-26.
 * - Sisanya tetap dikirim aplikasi walau Traefik juga menyetel sebagian (nosniff, frame,
 *   referrer, permissions): nilainya sama/lebih ketat, dan uji lokal/smoke test tanpa
 *   Traefik tetap mendapat baseline yang sama.
 *
 * Jangan dilonggarkan tanpa justifikasi tertulis di PR dan persetujuan owner.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // image Docker ramping (Dockerfile menyalin .next/standalone)
  poweredByHeader: false,
  // Optimasi next/image DIPERTAHANKAN (beda dari web-starter yang `unoptimized`): foto hero
  // beranda 171 KB JPEG `sizes="100vw"` — tanpa resize, HP mengunduh ukuran penuh dan
  // target Lighthouse mobile ≥ 90 (DoD) terancam. Konsekuensi: `sharp` tetap di standalone,
  // cache hasil optimasi di /app/.next/cache/images (tmpfs 64 MB di compose infra).
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
