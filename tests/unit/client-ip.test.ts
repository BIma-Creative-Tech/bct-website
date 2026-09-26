import { describe, expect, it } from "vitest";
import { clientIpFrom } from "@/lib/client-ip";

const h = (init: Record<string, string>) => new Headers(init);

describe("clientIpFrom (di belakang Traefik)", () => {
  it("pakai entri X-Forwarded-For paling kanan (ditulis Traefik)", () => {
    expect(clientIpFrom(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientIpFrom(h({ "x-forwarded-for": "203.0.113.9" }))).toBe("203.0.113.9");
  });
  it("entri paling kanan tidak sah → null, TIDAK mundur ke entri kiri yang bisa dikarang", () => {
    expect(clientIpFrom(h({ "x-forwarded-for": "6.6.6.6, <script>" }))).toBeNull();
    expect(clientIpFrom(h({ "x-forwarded-for": "6.6.6.6, " }))).toBeNull();
  });
  it("fallback X-Real-Ip lalu null; nilai tak valid diabaikan", () => {
    expect(clientIpFrom(h({ "x-real-ip": "2001:db8::1" }))).toBe("2001:db8::1");
    expect(clientIpFrom(h({ "x-real-ip": "bukan-ip" }))).toBeNull();
    expect(clientIpFrom(h({}))).toBeNull();
  });
  it("tidak lagi membaca x-vercel-forwarded-for (jalur VERCEL=1 dibuang)", () => {
    expect(clientIpFrom(h({ "x-vercel-forwarded-for": "198.51.100.7" }))).toBeNull();
  });
});
