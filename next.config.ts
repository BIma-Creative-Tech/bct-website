import type { NextConfig } from "next";

/**
 * Security headers — diaudit oleh agent security-auditor.
 * CSP mengizinkan self + Umami (analytics self-host). Jangan dilonggarkan
 * tanpa justifikasi tertulis di PR dan persetujuan owner.
 */
const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC
  ? new URL(process.env.NEXT_PUBLIC_UMAMI_SRC).origin
  : "";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' ${umamiSrc}`.trim(),
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
