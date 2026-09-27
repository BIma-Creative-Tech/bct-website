import { z } from "zod";
import { ENV_UMAMI, masalahUrlSkrip, websiteIdSah } from "@/lib/umami";

/**
 * Env runtime — KONTRAK container. Pola dan nama SAMA dengan web-starter (`src/lib/env.ts`) dan
 * template infra `templates/web-client/docker-compose.contact.yml` (ADR 2026-09-26 "Form kontak:
 * email SMTP primer + webhook opsional", G-41):
 *   SITE_URL (wajib) — URL publik kanonik, sumber metadataBase/canonical/og:url/sitemap/robots.
 *   CONTACT_ENABLED (default false) — `true` → kanal EMAIL /api/lead aktif; SMTP_HOST,
 *     SMTP_USER, SMTP_FROM_ADDRESS, SMTP_PASSWORD_FILE wajib; SMTP_PORT default 587
 *     (465 = TLS implisit, lainnya STARTTLS wajib — ditegakkan di lib/mailer.ts).
 *   SMTP_PASSWORD_FILE = PATH file secret (dibaca saat kirim), bukan password.
 *   TURNSTILE_SITE_KEY + TURNSTILE_SECRET_FILE (G-43, opsional BERPASANGAN) — keduanya kosong →
 *     Turnstile mati (form seperti sebelumnya); keduanya terisi → widget di /kontak + verifikasi
 *     server; hanya salah satu → boot gagal (exit 1). Site key PUBLIK tapi sengaja BUKAN
 *     NEXT_PUBLIC_* (nilai itu dibakar saat build, sedangkan satu image melayani staging &
 *     production dengan widget berbeda; dan `assertNoPublicSecrets` menolak NEXT_PUBLIC_*_KEY):
 *     dibaca server saat request dan dioper ke form sebagai prop. Secret = PATH file.
 *   UMAMI_SCRIPT_URL + UMAMI_WEBSITE_ID (G-47, opsional BERPASANGAN; nama & aturan nilai di
 *     lib/umami.ts — kontrak infra plan 11, disetujui GATE 1 2026-09-27) — keduanya kosong → analytics mati;
 *     hanya salah satu atau nilai tidak sah → boot gagal (exit 1).
 *
 * Divalidasi saat boot (instrumentation.ts) → container exit 1 bila salah. Dibaca lazy
 * (getEnv) sehingga `next build` TIDAK membutuhkan env runtime: semua halaman dirender
 * dinamis per request (nonce CSP), jadi nilainya baru dibaca saat request.
 *
 * Beda dari web-starter (disengaja): CONTACT_ENABLED=false TIDAK mematikan /api/lead — ia hanya
 * mematikan kanal email. Kanal webhook `LEAD_WEBHOOK_URL` tetap opsional dan sengaja TIDAK
 * divalidasi di sini (pengerasan tujuannya — wajib https — masih keputusan owner). Tidak ada
 * kanal sama sekali → /api/lead 503 (ADR 2026-08-25).
 * Pesan error hanya menyebut NAMA variabel, tidak pernah nilainya.
 */
const booleanString = z
  .enum(["true", "false", "1", "0", ""], { message: "harus true/false" })
  .optional()
  .transform((v) => v === "true" || v === "1");

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
    SITE_URL: z
      .url({ protocol: /^https?$/, message: "harus URL http(s), mis. https://bimacreative.tech" })
      .transform((v) => v.replace(/\/+$/, "")),
    CONTACT_ENABLED: booleanString,
    SMTP_HOST: optionalString,
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_USER: optionalString,
    SMTP_FROM_ADDRESS: z.email({ message: "harus alamat email" }).optional(),
    SMTP_PASSWORD_FILE: optionalString,
    TURNSTILE_SITE_KEY: optionalString.pipe(
      z.string().regex(/^[A-Za-z0-9_-]{10,100}$/, { message: "format site key tidak sah" }).optional(),
    ),
    TURNSTILE_SECRET_FILE: optionalString,
    [ENV_UMAMI.scriptUrl]: optionalString,
    [ENV_UMAMI.websiteId]: optionalString,
  })
  .superRefine((env, ctx) => {
    if (Boolean(env.TURNSTILE_SITE_KEY) !== Boolean(env.TURNSTILE_SECRET_FILE)) {
      const hilang = env.TURNSTILE_SITE_KEY ? "TURNSTILE_SECRET_FILE" : "TURNSTILE_SITE_KEY";
      ctx.addIssue({ code: "custom", path: [hilang], message: "wajib berpasangan (isi keduanya atau kosongkan keduanya)" });
    }
    if (env.TURNSTILE_SECRET_FILE && !env.TURNSTILE_SECRET_FILE.startsWith("/")) {
      ctx.addIssue({ code: "custom", path: ["TURNSTILE_SECRET_FILE"], message: "harus path absolut" });
    }
    const skripUmami = env[ENV_UMAMI.scriptUrl];
    const idUmami = env[ENV_UMAMI.websiteId];
    if (Boolean(skripUmami) !== Boolean(idUmami)) {
      const hilang = skripUmami ? ENV_UMAMI.websiteId : ENV_UMAMI.scriptUrl;
      ctx.addIssue({ code: "custom", path: [hilang], message: "wajib berpasangan (isi keduanya atau kosongkan keduanya)" });
    }
    const masalahSkrip = skripUmami ? masalahUrlSkrip(skripUmami) : null;
    if (masalahSkrip) ctx.addIssue({ code: "custom", path: [ENV_UMAMI.scriptUrl], message: masalahSkrip });
    if (idUmami && !websiteIdSah(idUmami)) {
      ctx.addIssue({ code: "custom", path: [ENV_UMAMI.websiteId], message: "harus UUID" });
    }
    if (!env.CONTACT_ENABLED) return;
    for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_FROM_ADDRESS", "SMTP_PASSWORD_FILE"] as const) {
      if (!env[key]) {
        ctx.addIssue({ code: "custom", path: [key], message: "wajib bila CONTACT_ENABLED=true" });
      }
    }
    if (env.SMTP_PASSWORD_FILE && !env.SMTP_PASSWORD_FILE.startsWith("/")) {
      ctx.addIssue({ code: "custom", path: ["SMTP_PASSWORD_FILE"], message: "harus path absolut" });
    }
  });

export type Env = z.infer<typeof envSchema>;

/** Turnstile aktif = kedua env terisi (pasangan yang tidak lengkap sudah ditolak skema). */
export function turnstileAktif(env: Env): env is Env & { TURNSTILE_SITE_KEY: string; TURNSTILE_SECRET_FILE: string } {
  return Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_FILE);
}

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
