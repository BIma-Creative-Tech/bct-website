/**
 * Umami self-host (W3-02, G-47) — SATU-SATUNYA tempat nama env dan aturan nilainya.
 *
 * Kontrak PROVISIONAL platform (infra plan 11, belum final sampai GATE 1 owner): kalau namanya
 * berubah, cukup ganti `ENV_UMAMI` di bawah — skema env (lib/env.ts), CSP (proxy.ts) dan
 * layout membacanya dari sini.
 *
 *   UMAMI_SCRIPT_URL — URL lengkap skrip tracker, mis. https://analytics.bimacreative.tech/<nama>.js
 *     (nama berkas boleh kustom, TRACKER_SCRIPT_NAME Umami). Aturan: URL sah, WAJIB https, tanpa
 *     kredensial (user:pass@ akan terbit ke HTML setiap pengunjung), tanpa query & fragment (tidak
 *     dibutuhkan Umami; query bisa membawa token/penanda yang ikut terbit, dan melarangnya membuat
 *     nilai di HTML = nilai yang diaudit), path bukan "/" (pasti salah konfigurasi).
 *   UMAMI_WEBSITE_ID — UUID website di Umami.
 *
 * Berpasangan: keduanya kosong → analytics mati (nol skrip, CSP identik); keduanya sah → skrip
 * dirender di root layout + origin skrip masuk CSP script-src/connect-src; hanya satu / nilai
 * tidak sah → boot gagal (instrumentation.ts, exit 1) dengan NAMA variabel saja.
 * Env server yang dibaca saat request — BUKAN NEXT_PUBLIC_* (dibakar saat build, padahal satu
 * image melayani staging & production).
 */
export const ENV_UMAMI = {
  scriptUrl: "UMAMI_SCRIPT_URL",
  websiteId: "UMAMI_WEBSITE_ID",
} as const;

type NamaEnvUmami = (typeof ENV_UMAMI)[keyof typeof ENV_UMAMI];
/** Env tervalidasi (`getEnv()`) atau `process.env` mentah. */
export type SumberUmami = Partial<Record<NamaEnvUmami, string | undefined>> | Readonly<Record<string, string | undefined>>;

export type KonfigUmami = {
  /** URL skrip yang sudah dinormalisasi `URL.href`. */
  scriptUrl: string;
  /** Origin skrip — satu-satunya tambahan CSP (script-src + connect-src untuk `/api/send`). */
  origin: string;
  websiteId: string;
};

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Alasan URL skrip ditolak (tanpa menyebut nilainya), atau null bila sah. */
export function masalahUrlSkrip(nilai: string): string | null {
  let url: URL;
  try {
    url = new URL(nilai);
  } catch {
    return "harus URL lengkap, mis. https://analytics.example/script.js";
  }
  if (url.protocol !== "https:") return "harus https";
  if (url.username || url.password) return "tidak boleh memuat kredensial";
  if (url.search || url.hash || nilai.includes("?") || nilai.includes("#")) {
    return "tidak boleh memuat query atau fragment";
  }
  // WHATWG URL menerima `*` (dan beberapa tanda lain) di hostname — origin seperti itu akan
  // menjadi wildcard di CSP. Hanya nama domain ASCII (IDN sudah jadi punycode) atau IPv6 [..].
  if (!/^(?:[a-z0-9-]+(?:\.[a-z0-9-]+)*|\[[0-9a-f:.]+\])$/.test(url.hostname)) return "host tidak sah";
  if (url.pathname === "/") return "harus menunjuk berkas skrip, bukan akar domain";
  return null;
}

export function websiteIdSah(nilai: string): boolean {
  return POLA_UUID.test(nilai);
}

const bersih = (v: string | undefined) => v?.trim() || undefined;

/**
 * Konfigurasi Umami dari env, atau null bila mati. Fail-closed: pasangan tidak lengkap atau nilai
 * tidak sah → null (keadaan itu sudah membuat boot gagal lewat skema env, jadi di sini hanya
 * pengaman kedua untuk proxy.ts yang membaca process.env langsung).
 */
export function konfigUmami(sumber: SumberUmami): KonfigUmami | null {
  const scriptUrl = bersih(sumber[ENV_UMAMI.scriptUrl]);
  const websiteId = bersih(sumber[ENV_UMAMI.websiteId]);
  if (!scriptUrl || !websiteId) return null;
  if (masalahUrlSkrip(scriptUrl) || !websiteIdSah(websiteId)) return null;
  const url = new URL(scriptUrl);
  return { scriptUrl: url.href, origin: url.origin, websiteId: websiteId.toLowerCase() };
}

/** Origin https dari URL skrip Umami, atau null (tidak sah → tidak ada tambahan CSP). */
export function umamiOrigin(scriptUrl: string | undefined): string | null {
  if (!scriptUrl || masalahUrlSkrip(scriptUrl)) return null;
  return new URL(scriptUrl).origin;
}

/**
 * Atribut tag skrip (ADR 2026-09-27 "Umami runtime"):
 * - `data-domains` = hostname SITE_URL: tracker hanya mengirim bila halaman dibuka di host
 *   kanonik — salinan HTML di host lain (mirror/scraper, localhost, preview) tidak mencemari
 *   statistik, dan staging hanya mencatat bila ia sengaja diberi website ID sendiri.
 * - `data-do-not-track="true"`: pengunjung dengan Do Not Track tidak dicatat (privasi, UU PDP).
 */
export function atributSkripUmami(konfig: KonfigUmami, siteUrl: string): Record<string, string> {
  return {
    src: konfig.scriptUrl,
    "data-website-id": konfig.websiteId,
    "data-domains": new URL(siteUrl).hostname,
    "data-do-not-track": "true",
  };
}

/**
 * Props tag `<script defer>` Umami untuk root layout, atau null bila analytics mati ATAU nonce
 * request tidak ada (tanpa nonce, CSP 'strict-dynamic' memblokir skrip — lebih baik tidak
 * dirender). Nonce hanya dipasang di tag server-rendered ini; tidak pernah dioper ke komponen
 * client sebagai prop.
 */
export function propsSkripUmami(
  sumber: SumberUmami,
  siteUrl: string,
  nonce: string | null | undefined,
): (Record<string, string | boolean> & { defer: true; nonce: string }) | null {
  const konfig = konfigUmami(sumber);
  if (!konfig || !nonce) return null;
  return { defer: true, nonce, ...atributSkripUmami(konfig, siteUrl) };
}
