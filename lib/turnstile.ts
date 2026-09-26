import "server-only";
import { readFile } from "node:fs/promises";

/**
 * Verifikasi token Cloudflare Turnstile di server (G-43, bagian (b) G-20; keputusan owner
 * 2026-09-26). Tanpa paket npm: satu POST JSON ke siteverify.
 *
 * Kontrak (docs Cloudflare "Validate the token", dibaca 2026-09-26):
 * - POST https://challenges.cloudflare.com/turnstile/v0/siteverify, body JSON
 *   `{ secret, response, idempotency_key }`; jawaban JSON `success`, `hostname`, `action`,
 *   `error-codes`, `challenge_ts`.
 * - Token ≤ 2048 karakter, berlaku 300 s, SEKALI PAKAI.
 * - `remoteip` opsional — SENGAJA tidak dikirim (data minimal, UU PDP): Cloudflare sudah
 *   melihat pengunjung lewat widgetnya sendiri, dan pemeriksaannya tidak membutuhkannya.
 *
 * Yang diperiksa: `success === true`, `hostname` = host `SITE_URL`, `action` = `AKSI_PEMERIKSAAN`.
 * PENGECUALIAN SEMPIT: kunci rahasia UJI Cloudflare (tiga nilai terdokumentasi di bawah)
 * menjawab `hostname: "example.com"` tanpa `action` apa pun situsnya — untuk kunci itu saja
 * `hostname`/`action` tidak diperiksa. Kunci uji tidak pernah melindungi apa pun (selalu lolos /
 * selalu gagal), jadi boot mencatat peringatan bila salah satunya terpasang (instrumentation.ts).
 *
 * Sekali pakai ditegakkan DUA lapis: Cloudflare sendiri (`timeout-or-duplicate`) dan cache
 * lokal token yang pernah diperiksa (300 s) — token yang diputar ulang ditolak tanpa satu
 * pun panggilan jaringan. Satu kali coba ulang hanya bila jaringan GAGAL (bukan tenggat),
 * dengan `idempotency_key` yang sama supaya Cloudflare tidak menghitungnya sebagai pemakaian
 * kedua token itu.
 */
export const URL_SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const BATAS_WAKTU_TURNSTILE_MS = 5_000;
export const PANJANG_TOKEN_MAKS = 2_048;
const UMUR_TOKEN_MS = 300_000;
const MAKS_TOKEN_DIINGAT = 10_000;

/** Kunci rahasia uji Cloudflare (docs "Testing"): selalu lolos / selalu gagal / token terpakai. */
export const RAHASIA_UJI = new Set([
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
]);

/**
 * - `lolos`            → lanjut.
 * - `ditolak`          → Cloudflare menjawab bukan manusia / token tidak sah → 403 generik.
 * - `tak-terjangkau`   → siteverify tidak menjawab (jaringan/tenggat/5xx/internal-error).
 *                        Route MENOLAK dengan 503 (fail-closed, keputusan owner, ADR G-46).
 * - `galat-konfigurasi`→ berkas secret tidak terbaca → 503 (form tidak tersedia).
 */
export type HasilTurnstile = "lolos" | "ditolak" | "tak-terjangkau" | "galat-konfigurasi";

export type OpsiTurnstile = {
  berkasRahasia: string;
  hostSitus: string;
  aksi: string;
  fetchFn?: typeof fetch;
  sekarang?: () => number;
};

const tokenTerpakai = new Map<string, number>();

function ingatToken(token: string, sekarang: number): boolean {
  const kedaluwarsa = tokenTerpakai.get(token);
  if (kedaluwarsa !== undefined && kedaluwarsa > sekarang) return false;
  if (tokenTerpakai.size >= MAKS_TOKEN_DIINGAT) {
    for (const [t, k] of tokenTerpakai) if (k <= sekarang) tokenTerpakai.delete(t);
    // Masih penuh: buang yang tertua (Map mempertahankan urutan sisip). Cloudflare tetap
    // menolak token yang sudah dipakai, jadi yang hilang hanya jalan pintas lokalnya.
    while (tokenTerpakai.size >= MAKS_TOKEN_DIINGAT) {
      const tertua = tokenTerpakai.keys().next().value;
      if (tertua === undefined) break;
      tokenTerpakai.delete(tertua);
    }
  }
  tokenTerpakai.set(token, sekarang + UMUR_TOKEN_MS);
  return true;
}

type JawabanSiteverify = {
  success?: unknown;
  hostname?: unknown;
  action?: unknown;
  "error-codes"?: unknown;
};

export async function periksaTurnstile(token: unknown, opsi: OpsiTurnstile): Promise<HasilTurnstile> {
  const sekarang = opsi.sekarang ?? Date.now;
  if (typeof token !== "string" || token.length === 0 || token.length > PANJANG_TOKEN_MAKS) return "ditolak";
  if (!ingatToken(token, sekarang())) return "ditolak";

  let rahasia: string;
  try {
    rahasia = (await readFile(opsi.berkasRahasia, "utf8")).trim();
  } catch (err) {
    console.error(`[lead] secret Turnstile tidak terbaca: ${err instanceof Error ? err.name : "unknown"}`);
    return "galat-konfigurasi";
  }
  if (!rahasia) return "galat-konfigurasi";

  const fetchFn = opsi.fetchFn ?? fetch;
  const tenggat = AbortSignal.timeout(BATAS_WAKTU_TURNSTILE_MS);
  const body = JSON.stringify({ secret: rahasia, response: token, idempotency_key: crypto.randomUUID() });

  let jawaban: JawabanSiteverify | null = null;
  for (let percobaan = 0; percobaan < 2 && jawaban === null; percobaan++) {
    try {
      const res = await fetchFn(URL_SITEVERIFY, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        signal: tenggat,
        body,
      });
      if (!res.ok) {
        await res.body?.cancel().catch(() => undefined);
        console.error(`[lead] siteverify status ${res.status}`);
        return "tak-terjangkau";
      }
      jawaban = (await res.json()) as JawabanSiteverify;
    } catch {
      if (tenggat.aborted) break; // tenggat habis: jangan coba ulang
    }
  }
  if (jawaban === null || typeof jawaban !== "object") {
    console.error("[lead] siteverify tidak terjangkau atau melewati batas waktu");
    return "tak-terjangkau";
  }

  const kode = Array.isArray(jawaban["error-codes"]) ? jawaban["error-codes"] : [];
  if (jawaban.success !== true) {
    if (kode.includes("internal-error")) return "tak-terjangkau";
    return "ditolak";
  }
  if (!RAHASIA_UJI.has(rahasia)) {
    if (typeof jawaban.hostname !== "string" || jawaban.hostname.toLowerCase() !== opsi.hostSitus.toLowerCase()) {
      return "ditolak";
    }
    if (jawaban.action !== opsi.aksi) return "ditolak";
  }
  return "lolos";
}

/** Khusus uji: kosongkan cache token terpakai. */
export function _resetTokenTerpakai(): void {
  tokenTerpakai.clear();
}
