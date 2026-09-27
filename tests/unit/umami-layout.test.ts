import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateNonce } from "@/lib/csp";
import { OPSI_PRIVASI_UMAMI, atributSkripUmami, konfigUmami, propsSkripUmami } from "@/lib/umami";

/**
 * Tag Umami yang dirender root layout (`SkripUmami` di app/layout.tsx = `<script {...propsSkripUmami(...)} />`).
 * Dirender dengan react-dom/server seperti SSR sungguhan.
 */
const SKRIP = "https://analytics.example.test/stats.js";
const ID = "5b1c1e8a-2f4d-4c3a-9e7b-0d6f2a1b3c4d";
const AKTIF = { UMAMI_SCRIPT_URL: SKRIP, UMAMI_WEBSITE_ID: ID };

const render = (props: ReturnType<typeof propsSkripUmami>) =>
  props ? renderToStaticMarkup(createElement("script", props)) : "";

describe("root layout — skrip Umami (G-47)", () => {
  it("mati → tidak ada skrip", () => {
    expect(propsSkripUmami({}, "https://bimacreative.tech", generateNonce())).toBeNull();
    expect(propsSkripUmami({ UMAMI_SCRIPT_URL: SKRIP }, "https://bimacreative.tech", generateNonce())).toBeNull();
  });

  it("aktif → <script defer> dengan nonce request, website id, data-domains host kanonik, exclude-search, DNT", () => {
    const nonce = generateNonce();
    const html = render(propsSkripUmami(AKTIF, "https://bimacreative.tech", nonce));
    expect(html).toBe(
      `<script defer="" nonce="${nonce}" src="${SKRIP}" data-website-id="${ID}" ` +
        `data-domains="bimacreative.tech" data-exclude-search="true" data-do-not-track="true"></script>`,
    );
  });

  it("opsi privasi (GATE 1 Q4) = konstanta yang bisa dibalik; false → atributnya hilang", () => {
    expect(OPSI_PRIVASI_UMAMI).toEqual({ EXCLUDE_SEARCH: true, DO_NOT_TRACK: true });
    const atribut = atributSkripUmami(konfigUmami(AKTIF)!, "https://bimacreative.tech", {
      EXCLUDE_SEARCH: false,
      DO_NOT_TRACK: false,
    });
    expect(Object.keys(atribut)).toEqual(["src", "data-website-id", "data-domains"]);
  });

  it("data-domains mengikuti SITE_URL saat request (staging ≠ production, tanpa port)", () => {
    expect(propsSkripUmami(AKTIF, "https://bct.staging.bimacreative.tech", "n".repeat(24))?.["data-domains"]).toBe(
      "bct.staging.bimacreative.tech",
    );
    expect(propsSkripUmami(AKTIF, "http://localhost:3000", "n".repeat(24))?.["data-domains"]).toBe("localhost");
  });

  it("tanpa nonce (request tanpa CSP) → tidak dirender, daripada tag yang pasti diblokir", () => {
    expect(propsSkripUmami(AKTIF, "https://bimacreative.tech", null)).toBeNull();
    expect(propsSkripUmami(AKTIF, "https://bimacreative.tech", "")).toBeNull();
  });
});
