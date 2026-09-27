/**
 * Next.js 16: `middleware.ts` → `proxy.ts` (docs 01-app/03-api-reference/03-file-conventions/proxy.md).
 * Tugas: nonce per request + header CSP (port web-starter `src/proxy.ts`; pola docs
 * guides/content-security-policy.md). Header keamanan statis lain ada di next.config.ts;
 * HSTS di Traefik.
 *
 * `process.env.NODE_ENV === "development"` fail-closed: 'unsafe-eval' hanya di `next dev`
 * (G-14). Invariant produksinya dikunci guard `scripts/check-csp.mjs` terhadap header yang
 * BENAR-BENAR terkirim oleh image (G-15, diadaptasi — CSP tidak lagi dibakar ke
 * routes-manifest).
 */
import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, generateNonce } from "@/lib/csp";
import { konfigUmami } from "@/lib/umami";

export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  // Turnstile (G-43): tambahan CSP hanya bila widget aktif. Cukup memeriksa site key — pasangan
  // yang tidak lengkap sudah membuat boot gagal (instrumentation.ts), jadi tidak mungkin ada di sini.
  const turnstile = Boolean(process.env.TURNSTILE_SITE_KEY?.trim());
  // Umami (G-47): origin skrip hanya bila pasangan env lengkap & sah (dibaca saat request — satu
  // image untuk staging & production); selain itu CSP tanpa tambahan.
  const umami = konfigUmami(process.env);
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development", umami?.scriptUrl, turnstile);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
