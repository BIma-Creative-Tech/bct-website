import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";
import { isIndexable, urlKanonik } from "@/lib/site";

describe("parseEnv (kontrak env container)", () => {
  it("SITE_URL wajib", () => {
    expect(() => parseEnv({})).toThrow(/SITE_URL/);
  });

  it("SITE_URL harus http(s); garis miring penutup dibuang", () => {
    expect(parseEnv({ SITE_URL: "https://bimacreative.tech/" }).SITE_URL).toBe("https://bimacreative.tech");
    expect(() => parseEnv({ SITE_URL: "ftp://bimacreative.tech" })).toThrow(/SITE_URL/);
    expect(() => parseEnv({ SITE_URL: "bimacreative.tech" })).toThrow(/SITE_URL/);
  });

  it("pesan error tidak memuat nilai variabel", () => {
    expect(() => parseEnv({ SITE_URL: "javascript:alert(rahasia)" })).toThrow(/^(?!.*rahasia)/);
  });

  it("menolak NEXT_PUBLIC_* yang terlihat seperti secret", () => {
    expect(() => parseEnv({ SITE_URL: "http://localhost", NEXT_PUBLIC_LEAD_WEBHOOK_URL: "x" })).toThrow(
      /NEXT_PUBLIC_LEAD_WEBHOOK_URL/,
    );
    expect(() => parseEnv({ SITE_URL: "http://localhost", NEXT_PUBLIC_API_TOKEN: "x" })).toThrow(/NEXT_PUBLIC_API_TOKEN/);
    expect(parseEnv({ SITE_URL: "http://localhost", NEXT_PUBLIC_CONTOH_ID: "x" }).SITE_URL).toBe("http://localhost");
  });
});

describe("isIndexable (staging/localhost → noindex)", () => {
  it("staging & localhost tidak diindeks, production diindeks", () => {
    expect(isIndexable("https://bct.staging.bimacreative.tech")).toBe(false);
    expect(isIndexable("http://localhost")).toBe(false);
    expect(isIndexable("http://localhost:3000")).toBe(false);
    expect(isIndexable("http://127.0.0.1:3310")).toBe(false);
    expect(isIndexable("https://bimacreative.tech")).toBe(true);
    expect(isIndexable("https://www.bimacreative.tech")).toBe(true);
    // label utuh, bukan substring
    expect(isIndexable("https://stagingku.id")).toBe(true);
    expect(isIndexable("bukan url")).toBe(false);
  });
});

describe("urlKanonik (sama dengan canonical terbitan Next)", () => {
  it("beranda tanpa garis miring penutup, path lain apa adanya", () => {
    expect(urlKanonik("/", "https://bimacreative.tech")).toBe("https://bimacreative.tech");
    expect(urlKanonik("/pricing", "https://bimacreative.tech")).toBe("https://bimacreative.tech/pricing");
  });
});
