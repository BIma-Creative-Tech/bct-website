import { z } from "zod";

/**
 * Env runtime — KONTRAK container (templates/web-client di repo infra hanya meneruskan
 * `SITE_URL` + `CONTACT_ENABLED`; lihat README §Deploy). Pola sama dengan web-starter
 * (`src/lib/env.ts`), dipangkas ke yang dipakai situs ini:
 *   SITE_URL (wajib) — URL publik kanonik, sumber metadataBase/canonical/og:url/sitemap/robots.
 *
 * Divalidasi saat boot (instrumentation.ts) → container exit 1 bila salah. Dibaca lazy
 * (getEnv) sehingga `next build` TIDAK membutuhkan SITE_URL: semua halaman dirender
 * dinamis per request (nonce CSP), jadi nilainya baru dibaca saat request.
 *
 * `LEAD_WEBHOOK_URL` sengaja TIDAK divalidasi di sini: kosong = /api/lead membalas 503
 * (ADR 2026-08-25), dan pengerasan tujuannya (wajib https) masih keputusan owner.
 * Pesan error hanya menyebut NAMA variabel, tidak pernah nilainya.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  SITE_URL: z
    .url({ protocol: /^https?$/, message: "harus URL http(s), mis. https://bimacreative.tech" })
    .transform((v) => v.replace(/\/+$/, "")),
});

export type Env = z.infer<typeof envSchema>;

const SECRET_LIKE = /(SECRET|PASSWORD|PASSWD|TOKEN|PRIVATE|SMTP|WEBHOOK|_KEY$|^KEY)/i;

/** Tolak NEXT_PUBLIC_* yang terlihat seperti secret (nilai NEXT_PUBLIC_* di-inline ke bundel browser). */
export function assertNoPublicSecrets(source: Record<string, string | undefined>): void {
  const offenders = Object.keys(source).filter(
    (k) => k.startsWith("NEXT_PUBLIC_") && SECRET_LIKE.test(k.slice("NEXT_PUBLIC_".length)),
  );
  if (offenders.length > 0) {
    throw new Error(`Env tidak valid: variabel publik terlihat seperti secret: ${offenders.join(", ")}`);
  }
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  assertNoPublicSecrets(source);
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    throw new Error(`Env tidak valid: ${detail}`);
  }
  return result.data;
}

let cache: Env | undefined;

/** Env aplikasi (lazy + memo, sehingga `next build` tidak membutuhkan env runtime). */
export function getEnv(): Env {
  cache ??= parseEnv(process.env);
  return cache;
}
