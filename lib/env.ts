import { z } from "zod";

/**
 * Env runtime — KONTRAK container. Pola dan nama SAMA dengan web-starter (`src/lib/env.ts`) dan
 * template infra `templates/web-client/docker-compose.contact.yml` (ADR 2026-09-26 "Form kontak:
 * email SMTP primer + webhook opsional", G-41):
 *   SITE_URL (wajib) — URL publik kanonik, sumber metadataBase/canonical/og:url/sitemap/robots.
 *   CONTACT_ENABLED (default false) — `true` → kanal EMAIL /api/lead aktif; SMTP_HOST,
 *     SMTP_USER, SMTP_FROM_ADDRESS, SMTP_PASSWORD_FILE wajib; SMTP_PORT default 587
 *     (465 = TLS implisit, lainnya STARTTLS wajib — ditegakkan di lib/mailer.ts).
 *   SMTP_PASSWORD_FILE = PATH file secret (dibaca saat kirim), bukan password.
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
  })
  .superRefine((env, ctx) => {
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
