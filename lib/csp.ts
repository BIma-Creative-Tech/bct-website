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
 */
export function umamiOrigin(src: string | undefined): string | null {
  if (!src) return null;
  try {
    const url = new URL(src);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function buildCsp(nonce: string, isDev = false, umamiSrc?: string): string {
  if (!/^[A-Za-z0-9+/=_-]{16,}$/.test(nonce)) {
    throw new Error("nonce tidak valid");
  }
  const umami = umamiOrigin(umamiSrc);
  const extra = umami ? ` ${umami}` : "";
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}${extra}`,
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
