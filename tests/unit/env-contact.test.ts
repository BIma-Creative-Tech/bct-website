import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

/** Matriks kontrak env form kontak (CONTACT_ENABLED + SMTP_*) — sama dengan web-starter (G-41). */
const DASAR = { SITE_URL: "http://localhost" };
const LENGKAP = {
  ...DASAR,
  CONTACT_ENABLED: "true",
  SMTP_HOST: "mail.contoh.id",
  SMTP_USER: "web@contoh.id",
  SMTP_FROM_ADDRESS: "web@contoh.id",
  SMTP_PASSWORD_FILE: "/run/secrets/smtp_password",
};

describe("parseEnv — CONTACT_ENABLED + SMTP_*", () => {
  it("default: CONTACT_ENABLED=false, SMTP_PORT=587, SMTP_* tidak wajib", () => {
    const env = parseEnv(DASAR);
    expect(env.CONTACT_ENABLED).toBe(false);
    expect(env.SMTP_PORT).toBe(587);
    expect(env.SMTP_HOST).toBeUndefined();
  });

  it.each([
    ["true", true],
    ["1", true],
    ["false", false],
    ["0", false],
    ["", false],
  ])("CONTACT_ENABLED=%j → %s (SMTP lengkap)", (nilai, hasil) => {
    expect(parseEnv({ ...LENGKAP, CONTACT_ENABLED: nilai }).CONTACT_ENABLED).toBe(hasil);
  });

  it.each(["yes", "TRUE", "on"])("CONTACT_ENABLED=%j ditolak", (nilai) => {
    expect(() => parseEnv({ ...DASAR, CONTACT_ENABLED: nilai })).toThrow(/CONTACT_ENABLED/);
  });

  it("CONTACT_ENABLED=true tanpa SMTP_* → keempatnya disebut", () => {
    expect(() => parseEnv({ ...DASAR, CONTACT_ENABLED: "true" })).toThrow(
      /SMTP_HOST.*SMTP_USER.*SMTP_FROM_ADDRESS.*SMTP_PASSWORD_FILE/,
    );
  });

  it.each(["SMTP_HOST", "SMTP_USER", "SMTP_FROM_ADDRESS", "SMTP_PASSWORD_FILE"] as const)(
    "CONTACT_ENABLED=true tanpa %s → ditolak",
    (kunci) => {
      const env: Record<string, string> = { ...LENGKAP };
      delete env[kunci];
      expect(() => parseEnv(env)).toThrow(new RegExp(`${kunci}: wajib`));
      // Kosong / spasi saja diperlakukan sama dengan tidak di-set.
      expect(() => parseEnv({ ...LENGKAP, [kunci]: "   " })).toThrow(new RegExp(kunci));
    },
  );

  it("CONTACT_ENABLED=false: SMTP_* kosong tidak apa-apa (kanal email mati)", () => {
    expect(parseEnv({ ...DASAR, CONTACT_ENABLED: "false" }).CONTACT_ENABLED).toBe(false);
  });

  it("SMTP_PORT: 465 dan 2525 diterima, 0/70000/abc ditolak", () => {
    expect(parseEnv({ ...LENGKAP, SMTP_PORT: "465" }).SMTP_PORT).toBe(465);
    expect(parseEnv({ ...LENGKAP, SMTP_PORT: "2525" }).SMTP_PORT).toBe(2525);
    for (const salah of ["0", "70000", "abc", "587.5"]) {
      expect(() => parseEnv({ ...LENGKAP, SMTP_PORT: salah })).toThrow(/SMTP_PORT/);
    }
  });

  it("SMTP_FROM_ADDRESS harus alamat email", () => {
    expect(() => parseEnv({ ...LENGKAP, SMTP_FROM_ADDRESS: "bukan-email" })).toThrow(/SMTP_FROM_ADDRESS/);
  });

  it("SMTP_PASSWORD_FILE harus path absolut", () => {
    expect(() => parseEnv({ ...LENGKAP, SMTP_PASSWORD_FILE: "secrets/smtp" })).toThrow(/absolut/);
  });

  it("pesan error hanya menyebut NAMA, tidak pernah nilai", () => {
    let pesan = "";
    try {
      parseEnv({ ...LENGKAP, SMTP_FROM_ADDRESS: "rahasia-dari", SMTP_PASSWORD_FILE: "rahasia/path" });
    } catch (err) {
      pesan = (err as Error).message;
    }
    expect(pesan).toMatch(/SMTP_FROM_ADDRESS/);
    expect(pesan).not.toMatch(/rahasia/);
    expect(pesan).not.toMatch(/mail\.contoh\.id/);
  });

  it("menolak NEXT_PUBLIC_SMTP_* (akan ter-inline ke bundel browser)", () => {
    expect(() => parseEnv({ ...DASAR, NEXT_PUBLIC_SMTP_PASSWORD: "x" })).toThrow(/NEXT_PUBLIC_SMTP_PASSWORD/);
  });
});
