import { getEnv } from "@/lib/env";

/**
 * Situs boleh diindeks mesin pencari? Tidak untuk staging/localhost — konvensi platform
 * (sama dengan web-starter `src/lib/site.ts`): staging memakai subdomain
 * `*.staging.<domain>` (usulan: `bct.staging.bimacreative.tech`), jadi host yang mengandung
 * label `staging` atau localhost/IP loopback otomatis `noindex` + robots `Disallow: /`.
 */
export function isIndexable(siteUrl: string): boolean {
  let host: string;
  try {
    host = new URL(siteUrl).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") return false;
  return !host.split(".").includes("staging");
}

/** URL publik kanonik tanpa garis miring penutup, dari env `SITE_URL` (dibaca saat request). */
export function siteUrl(): string {
  return getEnv().SITE_URL;
}

/**
 * URL absolut yang PERSIS SAMA dengan <link rel="canonical"> terbitan Next untuk path yang
 * sama: beranda tanpa garis miring penutup, path lain apa adanya.
 */
export function urlKanonik(path: string, base: string = siteUrl()): string {
  const url = new URL(path, base);
  return url.pathname === "/" ? url.href.replace(/\/+$/, "") : url.href;
}
