import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/lead/route";

// `import "server-only"` (lib/lead-recipient.ts, lib/mailer.ts) melempar di luar bundler Next.
vi.mock("server-only", () => ({}));

/**
 * Pagar Origin/Host dan identitas rate limit `/api/lead` (tanpa menulis ulang route).
 * LEAD_WEBHOOK_URL tidak diset dan CONTACT_ENABLED mati → kiriman sah berakhir 503 (ADR 2026-08-25), jadi tidak
 * ada panggilan jaringan. State rate limit tinggal di modul → tiap uji memakai IP sendiri.
 */
const BODY_SAH = JSON.stringify({
  nama: "Budi Santoso",
  kontak: "budi@contoh.id",
  pesan: "Halo, saya ingin konsultasi Odoo.",
  produk: "odoo",
  sejakDibuka: 60_000,
});

function kirim(headers: Record<string, string>, body = BODY_SAH, url = "http://0.0.0.0:3000/api/lead") {
  return POST(
    new NextRequest(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body,
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("SITE_URL", "https://bimacreative.tech");
  vi.stubEnv("CONTACT_ENABLED", "");
  vi.stubEnv("LEAD_WEBHOOK_URL", "");
  vi.stubEnv("VERCEL", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/lead — pagar Origin vs Host", () => {
  it("Origin = host publik yang diteruskan Traefik (Host) → lolos pagar (503: webhook belum diisi)", async () => {
    const res = await kirim({
      host: "bimacreative.tech",
      origin: "https://bimacreative.tech",
      "x-forwarded-for": "203.0.113.10",
    });
    expect(res.status).toBe(503);
  });

  it("Origin asing → 403", async () => {
    const res = await kirim({ host: "bimacreative.tech", origin: "https://evil.example", "x-forwarded-for": "203.0.113.11" });
    expect(res.status).toBe(403);
  });

  it("X-Forwarded-Host tidak menambah origin ke daftar putih → 403", async () => {
    const res = await kirim({
      host: "bimacreative.tech",
      "x-forwarded-host": "evil.example",
      origin: "https://evil.example",
      "x-forwarded-for": "203.0.113.12",
    });
    expect(res.status).toBe(403);
  });

  it("Origin: null (konteks opaque) → 403; Origin absen → diterima (keputusan desain lama)", async () => {
    expect((await kirim({ host: "bimacreative.tech", origin: "null", "x-forwarded-for": "203.0.113.13" })).status).toBe(403);
    expect((await kirim({ host: "bimacreative.tech", "x-forwarded-for": "203.0.113.14" })).status).toBe(503);
  });

  it("content-type bukan JSON → 415 (tetap)", async () => {
    const res = await kirim({ host: "bimacreative.tech", "content-type": "text/plain", "x-forwarded-for": "203.0.113.15" });
    expect(res.status).toBe(415);
  });
});

describe("POST /api/lead — identitas rate limit dari Traefik", () => {
  const dasar = { host: "bimacreative.tech", origin: "https://bimacreative.tech" };

  it("5 per IP per menit; IP lain (entri XFF paling kanan) punya ember sendiri", async () => {
    const statusA: number[] = [];
    for (let i = 0; i < 6; i++) statusA.push((await kirim({ ...dasar, "x-forwarded-for": "198.51.100.1" })).status);
    expect(statusA).toEqual([503, 503, 503, 503, 503, 429]);
    // Entri kiri dikarang klien tidak memberi ember baru: yang dihitung tetap 198.51.100.1.
    expect((await kirim({ ...dasar, "x-forwarded-for": "1.2.3.4, 198.51.100.1" })).status).toBe(429);
    expect((await kirim({ ...dasar, "x-forwarded-for": "198.51.100.2" })).status).toBe(503);
  });

  it("VERCEL=1 + x-vercel-forwarded-for tidak lagi dipercaya", async () => {
    vi.stubEnv("VERCEL", "1");
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      statuses.push(
        (await kirim({ ...dasar, "x-forwarded-for": "198.51.100.3", "x-vercel-forwarded-for": `192.0.2.${i + 1}` })).status,
      );
    }
    expect(statuses.at(-1)).toBe(429);
  });

  it("tanpa IP sah → ember global (30/menit), bukan 5", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 31; i++) statuses.push((await kirim(dasar)).status);
    expect(statuses.slice(0, 30).every((s) => s === 503)).toBe(true);
    expect(statuses[30]).toBe(429);
  });
});
