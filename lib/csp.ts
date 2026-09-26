/**
 * Content-Security-Policy ber-nonce per request (port web-starter `src/lib/csp.ts`; pola docs
 * Next 16 guides/content-security-policy.md). Dipasang oleh `proxy.ts`.
 *
 * - script-src: nonce per request + 'strict-dynamic', TANPA 'unsafe-inline' (G-32).
 *   'unsafe-eval' hanya di `next dev` (React dev overlay menyusun callstack lewat eval —
 *   pengecualian G-14, fail-closed: hanya bila `isDev` true).
 * - Umami (NEXT_PUBLIC_UMAMI_SRC, opsional): origin-nya diizinkan di script-src (fallback
 *   peramban CSP2; di CSP3 'strict-dynamic' mengabaikan host, jadi skrip Umami WAJIB
 *   dirender lewat `next/script` yang otomatis menerima nonce) dan di connect-src (beacon).
 *   Hanya origin https yang diterima; nilai tak sah diabaikan (fail-closed).
 * - style-src 'unsafe-inline' dipertahankan dari baseline lama (G-04): Tailwind/next/font dan
 *   atribut `style` inline. Sengaja TANPA nonce — menurut CSP3 kehadiran nonce membuat
 *   'unsafe-inline' diabaikan.
 * - font-src 'self' data: dipertahankan dari baseline lama.
 * - HSTS di Traefik (middleware security-headers), bukan di sini.
 * - Turnstile (G-43) — HANYA bila `turnstile` true (env TURNSTILE_SITE_KEY terisi), di SEMUA
 *   halaman (navigasi klien ke /kontak mempertahankan CSP dokumen halaman pertama). Tambahan
 *   minimal sesuai docs Cloudflare "Content Security Policy" (dibaca 2026-09-26):
 *     script-src + https://challenges.cloudflare.com — fallback peramban tanpa CSP3; di CSP3
 *       'strict-dynamic' mengabaikan host, dan api.js dimuat oleh skrip ber-nonce milik form
 *       (non-parser-inserted), yang memang diizinkan 'strict-dynamic';
 *     frame-src 'self' https://challenges.cloudflare.com — widget adalah iframe; tanpa
 *       frame-src, default-src 'self' memblokirnya ('self' dipertahankan = perilaku lama).
 *   connect-src TIDAK ditambah: docs hanya memintanya untuk pre-clearance (tidak dipakai),
 *   dan itu pun cukup 'self'. Nihil tambahan saat Turnstile mati — CSP identik dengan sebelum G-43.
 */
export const ASAL_TURNSTILE = "https://challenges.cloudflare.com";

export function umamiOrigin(src: string | undefined): string | null {
  if (!src) return null;
  try {
    const url = new URL(src);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function buildCsp(nonce: string, isDev = false, umamiSrc?: string, turnstile = false): string {
  if (!/^[A-Za-z0-9+/=_-]{16,}$/.test(nonce)) {
    throw new Error("nonce tidak valid");
  }
  const umami = umamiOrigin(umamiSrc);
  const extra = umami ? ` ${umami}` : "";
  const ts = turnstile ? ` ${ASAL_TURNSTILE}` : "";
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}${extra}${ts}`,
    ...(turnstile ? [`frame-src 'self' ${ASAL_TURNSTILE}`] : []),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${extra}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}

/** 128-bit nonce acak (Web Crypto; jalan di runtime Node maupun edge). */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
