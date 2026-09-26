import { describe, expect, it } from "vitest";
import { parseEnv, turnstileAktif } from "@/lib/env";

/** Matriks env Turnstile (G-43): opsional, WAJIB berpasangan. */
const DASAR = { SITE_URL: "https://bct.staging.bimacreative.tech" };
const KUNCI = "1x00000000000000000000AA";
const BERKAS = "/run/secrets/turnstile_secret";

describe("parseEnv — TURNSTILE_SITE_KEY + TURNSTILE_SECRET_FILE", () => {
  it("keduanya kosong → mati (form seperti sebelum G-43)", () => {
    expect(turnstileAktif(parseEnv(DASAR))).toBe(false);
    expect(turnstileAktif(parseEnv({ ...DASAR, TURNSTILE_SITE_KEY: " ", TURNSTILE_SECRET_FILE: "" }))).toBe(false);
  });

  it("keduanya terisi → aktif", () => {
    const env = parseEnv({ ...DASAR, TURNSTILE_SITE_KEY: KUNCI, TURNSTILE_SECRET_FILE: BERKAS });
    expect(turnstileAktif(env)).toBe(true);
    expect(env.TURNSTILE_SITE_KEY).toBe(KUNCI);
  });

  it("hanya site key → error menyebut TURNSTILE_SECRET_FILE (boot exit 1)", () => {
    expect(() => parseEnv({ ...DASAR, TURNSTILE_SITE_KEY: KUNCI })).toThrow(/TURNSTILE_SECRET_FILE/);
  });

  it("hanya secret file → error menyebut TURNSTILE_SITE_KEY", () => {
    expect(() => parseEnv({ ...DASAR, TURNSTILE_SECRET_FILE: BERKAS })).toThrow(/TURNSTILE_SITE_KEY/);
  });

  it("secret file bukan path absolut → ditolak", () => {
    expect(() => parseEnv({ ...DASAR, TURNSTILE_SITE_KEY: KUNCI, TURNSTILE_SECRET_FILE: "secret.txt" })).toThrow(
      /TURNSTILE_SECRET_FILE: harus path absolut/,
    );
  });

  it.each(["kunci ber spasi", "<script>", "pendek", `${"a".repeat(101)}`])("site key %j ditolak", (k) => {
    expect(() => parseEnv({ ...DASAR, TURNSTILE_SITE_KEY: k, TURNSTILE_SECRET_FILE: BERKAS })).toThrow(
      /TURNSTILE_SITE_KEY/,
    );
  });

  it("NEXT_PUBLIC_TURNSTILE_SITE_KEY tetap ditolak (site key lewat env server + prop)", () => {
    expect(() => parseEnv({ ...DASAR, NEXT_PUBLIC_TURNSTILE_SITE_KEY: KUNCI })).toThrow(/NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  });

  it("pesan error tidak memuat nilai", () => {
    try {
      parseEnv({ ...DASAR, TURNSTILE_SITE_KEY: "0x4AAAAAAArahasia<>" , TURNSTILE_SECRET_FILE: BERKAS });
    } catch (e) {
      expect(String(e)).not.toContain("rahasia");
    }
  });
});
