import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { _resetTokenTerpakai, periksaTurnstile, RAHASIA_UJI, URL_SITEVERIFY } from "@/lib/turnstile";

/**
 * Verifikasi Turnstile di server (G-43). `fetch` di-mock dengan perilaku kunci UJI resmi
 * Cloudflare (docs "Testing"): 1x… selalu lolos, 2x… selalu gagal, 3x… token terpakai; token
 * uji = "XXXX.DUMMY.TOKEN.XXXX", jawaban siteverify kunci uji ber-hostname "example.com".
 */
const TOKEN_UJI = "XXXX.DUMMY.TOKEN.XXXX";
const LOLOS = "1x0000000000000000000000000000000AA";
const GAGAL = "2x0000000000000000000000000000000AA";
const TERPAKAI = "3x0000000000000000000000000000000AA";

const dir = mkdtempSync(join(tmpdir(), "ts-"));
function berkas(isi: string): string {
  const p = join(dir, `${Math.random().toString(36).slice(2)}.txt`);
  writeFileSync(p, `${isi}\n`);
  return p;
}

/** Tiruan siteverify: perilaku kunci uji + kunci "produksi" palsu yang menjawab apa adanya. */
function siteverifyPalsu(jawabanProduksi?: Record<string, unknown>) {
  return vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const { secret, response } = JSON.parse(String(init?.body)) as { secret: string; response: string };
    const json = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (secret === LOLOS) return json({ success: true, hostname: "example.com", "error-codes": [] });
    if (secret === GAGAL) return json({ success: false, "error-codes": ["invalid-input-response"] });
    if (secret === TERPAKAI) return json({ success: false, "error-codes": ["timeout-or-duplicate"] });
    return json(jawabanProduksi ?? { success: response === "token-sah", hostname: "bimacreative.tech", action: "kontak" });
  });
}

const dasar = { hostSitus: "bimacreative.tech", aksi: "kontak" };
let nomor = 0;
const tokenBaru = () => `tok-${++nomor}`;

beforeEach(() => {
  _resetTokenTerpakai();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("periksaTurnstile — kunci uji Cloudflare", () => {
  it("tiga kunci uji terdaftar", () => {
    expect([...RAHASIA_UJI]).toEqual([LOLOS, GAGAL, TERPAKAI]);
  });

  it("1x… (selalu lolos) → lolos walau hostname 'example.com' tanpa action", async () => {
    const f = siteverifyPalsu();
    expect(await periksaTurnstile(TOKEN_UJI, { ...dasar, berkasRahasia: berkas(LOLOS), fetchFn: f })).toBe("lolos");
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe(URL_SITEVERIFY);
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({ secret: LOLOS, response: TOKEN_UJI });
    expect(body.idempotency_key).toMatch(/^[0-9a-f-]{36}$/);
    expect(body).not.toHaveProperty("remoteip"); // data minimal
  });

  it("2x… (selalu gagal) → ditolak; 3x… (token terpakai) → ditolak", async () => {
    const f = siteverifyPalsu();
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: berkas(GAGAL), fetchFn: f })).toBe("ditolak");
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: berkas(TERPAKAI), fetchFn: f })).toBe(
      "ditolak",
    );
  });
});

describe("periksaTurnstile — kunci produksi", () => {
  const rahasia = berkas("0x4AAAAAAAprod-secret-palsu");

  it("success + hostname + action cocok → lolos", async () => {
    expect(await periksaTurnstile("token-sah", { ...dasar, berkasRahasia: rahasia, fetchFn: siteverifyPalsu() })).toBe(
      "lolos",
    );
  });

  it.each([
    ["hostname lain", { success: true, hostname: "evil.example", action: "kontak" }],
    ["action lain", { success: true, hostname: "bimacreative.tech", action: "login" }],
    ["tanpa action", { success: true, hostname: "bimacreative.tech" }],
    ["success false", { success: false, "error-codes": ["invalid-input-response"] }],
    ["success bukan boolean", { success: "true", hostname: "bimacreative.tech", action: "kontak" }],
  ])("%s → ditolak", async (_n, jawaban) => {
    expect(
      await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: rahasia, fetchFn: siteverifyPalsu(jawaban) }),
    ).toBe("ditolak");
  });

  it("token absen/bukan string/terlalu panjang → ditolak TANPA panggilan jaringan", async () => {
    const f = siteverifyPalsu();
    for (const t of [undefined, "", 123, { a: 1 }, "x".repeat(2049)]) {
      expect(await periksaTurnstile(t, { ...dasar, berkasRahasia: rahasia, fetchFn: f })).toBe("ditolak");
    }
    expect(f).not.toHaveBeenCalled();
  });

  it("sekali pakai: token yang sama kedua kalinya → ditolak tanpa panggilan jaringan", async () => {
    const f = siteverifyPalsu({ success: true, hostname: "bimacreative.tech", action: "kontak" });
    const t = tokenBaru();
    expect(await periksaTurnstile(t, { ...dasar, berkasRahasia: rahasia, fetchFn: f })).toBe("lolos");
    expect(await periksaTurnstile(t, { ...dasar, berkasRahasia: rahasia, fetchFn: f })).toBe("ditolak");
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("jaringan gagal sekali → coba ulang SEKALI dengan idempotency_key yang sama", async () => {
    const ok = siteverifyPalsu({ success: true, hostname: "bimacreative.tech", action: "kontak" });
    const f = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockImplementation(ok);
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: rahasia, fetchFn: f })).toBe("lolos");
    expect(f).toHaveBeenCalledTimes(2);
    const k1 = JSON.parse(String(f.mock.calls[0]![1].body)).idempotency_key;
    const k2 = JSON.parse(String(f.mock.calls[1]![1].body)).idempotency_key;
    expect(k1).toBe(k2);
  });

  it("tak terjangkau (gagal 2×, 5xx, internal-error) → 'tak-terjangkau'", async () => {
    const mati = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: rahasia, fetchFn: mati })).toBe(
      "tak-terjangkau",
    );
    expect(mati).toHaveBeenCalledTimes(2);
    const lima = vi.fn(async () => new Response("x", { status: 503 }));
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: rahasia, fetchFn: lima })).toBe(
      "tak-terjangkau",
    );
    const internal = siteverifyPalsu({ success: false, "error-codes": ["internal-error"] });
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: rahasia, fetchFn: internal })).toBe(
      "tak-terjangkau",
    );
  });

  it("berkas secret tidak terbaca / kosong → 'galat-konfigurasi', nilai tidak di-log", async () => {
    const f = siteverifyPalsu();
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: "/tidak/ada", fetchFn: f })).toBe(
      "galat-konfigurasi",
    );
    expect(await periksaTurnstile(tokenBaru(), { ...dasar, berkasRahasia: berkas(""), fetchFn: f })).toBe(
      "galat-konfigurasi",
    );
    expect(f).not.toHaveBeenCalled();
    expect(vi.mocked(console.error).mock.calls.flat().join(" ")).not.toContain("prod-secret");
  });
});
