import { describe, expect, it } from "vitest";
import { buildCsp, generateNonce, umamiOrigin } from "@/lib/csp";

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
