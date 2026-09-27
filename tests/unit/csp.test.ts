import { describe, expect, it } from "vitest";
import { buildCsp, generateNonce } from "@/lib/csp";
import { umamiOrigin } from "@/lib/umami";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `))!;

describe("CSP ber-nonce (lib/csp.ts)", () => {
  it("nonce acak, base64, 128 bit", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9+/]{22}==$/);
  });

  it("directive persis sesuai kebijakan (production, tanpa Umami)", () => {
    const n = generateNonce();
    expect(buildCsp(n, false)).toBe(
      [
        "default-src 'self'",
        `script-src 'self' 'nonce-${n}' 'strict-dynamic'`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join("; "),
    );
  });

  it("script-src tanpa unsafe-inline/unsafe-eval di production; style-src tanpa nonce", () => {
    const csp = buildCsp(generateNonce(), false, "https://analytics.example.com/script.js");
    expect(directive(csp, "script-src")).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(directive(csp, "style-src")).not.toContain("nonce-");
  });

  it("unsafe-eval hanya di mode dev (G-14)", () => {
    expect(directive(buildCsp(generateNonce(), true), "script-src")).toContain("'unsafe-eval'");
  });

  it("Umami: origin https masuk script-src & connect-src; nilai tak sah/http diabaikan", () => {
    const csp = buildCsp(generateNonce(), false, "https://analytics.example.com/script.js");
    expect(directive(csp, "script-src")).toMatch(/ https:\/\/analytics\.example\.com$/);
    expect(directive(csp, "connect-src")).toBe("connect-src 'self' https://analytics.example.com");
    expect(umamiOrigin("http://analytics.example.com/s.js")).toBeNull();
    expect(umamiOrigin("bukan url; script-src *")).toBeNull();
    expect(umamiOrigin(undefined)).toBeNull();
  });

  it("menolak nonce yang bisa menyuntik directive", () => {
    expect(() => buildCsp("abc'; script-src *", false)).toThrow();
    expect(() => buildCsp("short", false)).toThrow();
  });
});

describe("CSP — Turnstile (G-43)", () => {
  it("mati (bawaan): identik dengan tanpa argumen — nihil challenges.cloudflare.com, nihil frame-src", () => {
    const n = generateNonce();
    expect(buildCsp(n, false, undefined, false)).toBe(buildCsp(n, false));
    expect(buildCsp(n, false)).not.toContain("challenges.cloudflare.com");
    expect(buildCsp(n, false)).not.toContain("frame-src");
  });

  it("aktif: hanya script-src + frame-src bertambah; connect-src, frame-ancestors tetap", () => {
    const n = generateNonce();
    const csp = buildCsp(n, false, undefined, true);
    expect(directive(csp, "script-src")).toBe(
      `script-src 'self' 'nonce-${n}' 'strict-dynamic' https://challenges.cloudflare.com`,
    );
    expect(directive(csp, "frame-src")).toBe("frame-src 'self' https://challenges.cloudflare.com");
    expect(directive(csp, "connect-src")).toBe("connect-src 'self'");
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(csp, "script-src")).not.toContain("unsafe-inline");
    const tanpa = buildCsp(n, false).split("; ");
    const dengan = csp.split("; ");
    expect(dengan.filter((d) => !tanpa.includes(d))).toHaveLength(2);
  });
});

describe("CSP — Umami runtime (G-47)", () => {
  const URL_SKRIP = "https://analytics.example.test/stats.js";

  it("mati: identik dengan tanpa argumen — tidak ada host tambahan di mana pun", () => {
    const n = generateNonce();
    expect(buildCsp(n, false, undefined)).toBe(buildCsp(n, false));
    expect(buildCsp(n, false, "")).toBe(buildCsp(n, false));
  });

  it("aktif: HANYA origin turunan masuk script-src & connect-src; direktif lain tetap", () => {
    const n = generateNonce();
    const csp = buildCsp(n, false, URL_SKRIP);
    expect(directive(csp, "script-src")).toBe(`script-src 'self' 'nonce-${n}' 'strict-dynamic' https://analytics.example.test`);
    expect(directive(csp, "connect-src")).toBe("connect-src 'self' https://analytics.example.test");
    expect(csp).not.toContain("stats.js");
    expect(csp).not.toMatch(/\*/);
    const tanpa = buildCsp(n, false).split("; ");
    expect(csp.split("; ").filter((d) => !tanpa.includes(d))).toHaveLength(2);
  });

  it("port non-bawaan ikut origin; port bawaan dinormalisasi", () => {
    expect(directive(buildCsp(generateNonce(), false, "https://a.example.test:8443/s.js"), "connect-src")).toBe(
      "connect-src 'self' https://a.example.test:8443",
    );
    expect(directive(buildCsp(generateNonce(), false, "https://a.example.test:443/s.js"), "connect-src")).toBe(
      "connect-src 'self' https://a.example.test",
    );
  });

  it.each([
    "http://analytics.example.test/stats.js",
    "https://user:pw@analytics.example.test/stats.js",
    "https://analytics.example.test/stats.js?v=1",
    "https://analytics.example.test/stats.js#x",
    "https://analytics.example.test/",
    "https://*.example.test/stats.js",
    "javascript:alert(1)",
  ])("URL tak sah %j → tanpa tambahan (fail-closed)", (u) => {
    const n = generateNonce();
    expect(buildCsp(n, false, u)).toBe(buildCsp(n, false));
  });

  it("bersama Turnstile: keduanya ditambahkan, Umami tidak menyentuh frame-src", () => {
    const n = generateNonce();
    const csp = buildCsp(n, false, URL_SKRIP, true);
    expect(directive(csp, "script-src")).toBe(
      `script-src 'self' 'nonce-${n}' 'strict-dynamic' https://analytics.example.test https://challenges.cloudflare.com`,
    );
    expect(directive(csp, "frame-src")).toBe("frame-src 'self' https://challenges.cloudflare.com");
  });
});
