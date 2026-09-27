import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";
import { ENV_UMAMI, konfigUmami } from "@/lib/umami";

/** Matriks env Umami runtime (G-47): opsional, WAJIB berpasangan, nilai divalidasi saat boot. */
const DASAR = { SITE_URL: "https://bimacreative.tech" };
const SKRIP = "https://analytics.example.test/stats.js";
const ID = "5b1c1e8a-2f4d-4c3a-9e7b-0d6f2a1b3c4d";

describe("parseEnv — UMAMI_SCRIPT_URL + UMAMI_WEBSITE_ID", () => {
  it("nama env terpusat di lib/umami.ts", () => {
    expect(ENV_UMAMI).toEqual({ scriptUrl: "UMAMI_SCRIPT_URL", websiteId: "UMAMI_WEBSITE_ID" });
  });

  it("keduanya kosong/spasi → mati", () => {
    expect(konfigUmami(parseEnv(DASAR))).toBeNull();
    expect(konfigUmami(parseEnv({ ...DASAR, UMAMI_SCRIPT_URL: " ", UMAMI_WEBSITE_ID: "" }))).toBeNull();
  });

  it("keduanya sah → aktif, origin diturunkan dari URL skrip", () => {
    const env = parseEnv({ ...DASAR, UMAMI_SCRIPT_URL: ` ${SKRIP} `, UMAMI_WEBSITE_ID: ID.toUpperCase() });
    expect(konfigUmami(env)).toEqual({ scriptUrl: SKRIP, origin: "https://analytics.example.test", websiteId: ID });
  });

  it("nama berkas kustom tanpa .js tetap diterima", () => {
    expect(() => parseEnv({ ...DASAR, UMAMI_SCRIPT_URL: "https://a.example.test/u/insight", UMAMI_WEBSITE_ID: ID })).not.toThrow();
  });

  it("hanya URL skrip → error menyebut UMAMI_WEBSITE_ID (boot exit 1)", () => {
    expect(() => parseEnv({ ...DASAR, UMAMI_SCRIPT_URL: SKRIP })).toThrow(/UMAMI_WEBSITE_ID: wajib berpasangan/);
  });

  it("hanya website ID → error menyebut UMAMI_SCRIPT_URL", () => {
    expect(() => parseEnv({ ...DASAR, UMAMI_WEBSITE_ID: ID })).toThrow(/UMAMI_SCRIPT_URL: wajib berpasangan/);
  });

  it.each([
    ["http://analytics.example.test/stats.js", /harus https/],
    ["analytics.example.test/stats.js", /harus URL lengkap/],
    ["https://u:p@analytics.example.test/stats.js", /kredensial/],
    ["https://analytics.example.test/stats.js?v=2", /query atau fragment/],
    ["https://analytics.example.test/stats.js?", /query atau fragment/],
    ["https://analytics.example.test/stats.js#a", /query atau fragment/],
    ["https://analytics.example.test", /akar domain/],
    ["https://*.example.test/stats.js", /host tidak sah/],
  ])("URL skrip %j ditolak", (u, pesan) => {
    expect(() => parseEnv({ ...DASAR, UMAMI_SCRIPT_URL: u, UMAMI_WEBSITE_ID: ID })).toThrow(pesan);
  });

  it.each(["bukan-uuid", "5b1c1e8a2f4d4c3a9e7b0d6f2a1b3c4d", `${ID}x`, "<script>"])("website ID %j ditolak", (id) => {
    expect(() => parseEnv({ ...DASAR, UMAMI_SCRIPT_URL: SKRIP, UMAMI_WEBSITE_ID: id })).toThrow(/UMAMI_WEBSITE_ID: harus UUID/);
  });

  it("pesan error hanya menyebut NAMA variabel, tidak pernah nilainya", () => {
    for (const bad of [
      { UMAMI_SCRIPT_URL: "https://rahasia:sandi@a.example.test/s.js?token=rahasia", UMAMI_WEBSITE_ID: ID },
      { UMAMI_SCRIPT_URL: SKRIP, UMAMI_WEBSITE_ID: "rahasia-bukan-uuid" },
      { UMAMI_SCRIPT_URL: "https://rahasia.example.test/s.js" },
    ]) {
      let pesan = "";
      try {
        parseEnv({ ...DASAR, ...bad });
      } catch (e) {
        pesan = String(e);
      }
      expect(pesan).toMatch(/UMAMI_/);
      expect(pesan).not.toContain("rahasia");
    }
  });

  it("konfigUmami fail-closed untuk sumber mentah yang tidak lengkap/tidak sah", () => {
    expect(konfigUmami({ UMAMI_SCRIPT_URL: SKRIP })).toBeNull();
    expect(konfigUmami({ UMAMI_SCRIPT_URL: "http://a.example.test/s.js", UMAMI_WEBSITE_ID: ID })).toBeNull();
    expect(konfigUmami({ UMAMI_SCRIPT_URL: SKRIP, UMAMI_WEBSITE_ID: "x" })).toBeNull();
  });
});
