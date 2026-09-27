/**
 * Content-Security-Policy ber-nonce per request (port web-starter `src/lib/csp.ts`; pola docs
 * Next 16 guides/content-security-policy.md). Dipasang oleh `proxy.ts`.
 *
 * - script-src: nonce per request + 'strict-dynamic', TANPA 'unsafe-inline' (G-32).
 *   'unsafe-eval' hanya di `next dev` (React dev overlay menyusun callstack lewat eval —
 *   pengecualian G-14, fail-closed: hanya bila `isDev` true).
 * - Umami (G-47) — HANYA bila aktif (UMAMI_SCRIPT_URL + UMAMI_WEBSITE_ID, lib/umami.ts): origin
 *   yang DITURUNKAN dari URL skrip (bukan wildcard, bukan path) masuk script-src (fallback peramban
 *   tanpa CSP3; di CSP3 'strict-dynamic' mengabaikan host dan yang berlaku adalah nonce pada tag
 *   <script> di root layout) dan connect-src (tracker POST `<origin>/api/send` dengan header
 *   x-umami-*; CORS diurus server Umami, bukan CSP). Hanya
 *   https tanpa kredensial/query/fragment; nilai tak sah → tanpa tambahan (fail-closed). Mati →
 *   CSP identik dengan sebelum G-47.
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
import { umamiOrigin } from "@/lib/umami";

export const ASAL_TURNSTILE = "https://challenges.cloudflare.com";

/** `umamiScriptUrl` = URL skrip Umami bila analytics aktif (lihat `konfigUmami`), selain itu kosong. */
export function buildCsp(nonce: string, isDev = false, umamiScriptUrl?: string, turnstile = false): string {
  if (!/^[A-Za-z0-9+/=_-]{16,}$/.test(nonce)) {
    throw new Error("nonce tidak valid");
  }
  const umami = umamiOrigin(umamiScriptUrl);
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
