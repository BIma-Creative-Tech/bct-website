import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Kanal penerusan `/api/lead` (G-41): email SMTP primer + webhook opsional.
 * Mailer di-mock (lib/mailer.ts diuji terpisah di mailer.test.ts), `fetch` di-stub.
 * Tiap uji memuat ulang modul route → rate limit, anggaran, cincin waktu jebakan, cache env,
 * dan cache token Turnstile segar.
 */
vi.mock("server-only", () => ({}));
const m = vi.hoisted(() => ({ kirimEmailLead: vi.fn(async () => {}) }));
vi.mock("@/lib/mailer", () => ({ kirimEmailLead: m.kirimEmailLead }));

const EMAIL_AKTIF = {
  CONTACT_ENABLED: "true",
  SMTP_HOST: "mail.contoh.id",
  SMTP_USER: "web@contoh.id",
  SMTP_FROM_ADDRESS: "web@contoh.id",
  SMTP_PASSWORD_FILE: "/run/secrets/smtp_password",
};
const WEBHOOK = { LEAD_WEBHOOK_URL: "https://hook.contoh.id/lead" };

const LEAD = {
  nama: "Budi Santoso",
  kontak: "budi@contoh.id",
  pesan: "Halo, saya ingin konsultasi Odoo.",
  produk: "odoo",
  sejakDibuka: 60_000,
};

let fetchPalsu: ReturnType<typeof vi.fn>;
let nomorIp = 0;

async function muat(env: Record<string, string>) {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv("SITE_URL", "https://bimacreative.tech");
  vi.stubEnv("LEAD_WEBHOOK_URL", "");
  vi.stubEnv("CONTACT_ENABLED", "");
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return (await import("@/app/api/lead/route")).POST;
}

function kirim(POST: (req: NextRequest) => Promise<Response>, body: Record<string, unknown> = LEAD) {
  nomorIp += 1; // IP berbeda per kiriman → rate limit 5/IP tidak ikut campur
  return POST(
    new NextRequest("http://0.0.0.0:3000/api/lead", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "bimacreative.tech",
        origin: "https://bimacreative.tech",
        "x-forwarded-for": `198.51.${Math.floor(nomorIp / 250)}.${(nomorIp % 250) + 1}`,
      },
      body: JSON.stringify(body),
    }),
  );
}

async function ringkas(res: Response) {
  return { status: res.status, body: await res.json(), cc: res.headers.get("cache-control") };
}

beforeEach(() => {
  m.kirimEmailLead.mockReset();
  m.kirimEmailLead.mockResolvedValue(undefined);
  fetchPalsu = vi.fn(async () => new Response("ok", { status: 200 }));
  vi.stubGlobal("fetch", fetchPalsu);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/lead — kanal penerusan", () => {
  it("tidak ada kanal (email mati, webhook kosong) → 503, tidak ada yang dikirim", async () => {
    const POST = await muat({});
    expect((await kirim(POST)).status).toBe(503);
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
    expect(fetchPalsu).not.toHaveBeenCalled();
  });

  it("email saja: sukses → 200 {ok:true}; ke PENERIMA_LEAD, isi TIDAK diberi kutip spreadsheet", async () => {
    const POST = await muat(EMAIL_AKTIF);
    const res = await kirim(POST, { ...LEAD, pesan: "=HYPERLINK(\"x\") baris satu\nbaris dua" });
    expect(await ringkas(res)).toEqual({ status: 200, body: { ok: true }, cc: "no-store" });
    expect(m.kirimEmailLead).toHaveBeenCalledTimes(1);
    const [env, ke, lead] = m.kirimEmailLead.mock.calls[0] as unknown as [
      { CONTACT_ENABLED: boolean },
      string,
      { pesan: string; produk: string },
    ];
    expect(env.CONTACT_ENABLED).toBe(true);
    expect(ke).toBe("info@bimacreative.tech");
    expect(lead.pesan.startsWith("=HYPERLINK")).toBe(true);
    expect(lead.produk).toBe("odoo");
    expect(fetchPalsu).not.toHaveBeenCalled();
  });

  it("email saja: gagal → 502 generik (tidak pernah klaim terkirim)", async () => {
    const POST = await muat(EMAIL_AKTIF);
    m.kirimEmailLead.mockRejectedValueOnce(Object.assign(new Error("Invalid login: 535 user budi"), { code: "EAUTH" }));
    const res = await kirim(POST);
    expect(await ringkas(res)).toEqual({
      status: 502,
      body: { error: "Gagal mengirim. Silakan hubungi kami lewat WhatsApp." },
      cc: "no-store",
    });
    const log = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(log).toContain("EAUTH");
    expect(log).not.toMatch(/budi|535|Budi/); // tanpa isi pesan error / PII
  });

  it("webhook saja: perilaku lama — 2xx → 200, non-2xx → 502, muatan diberi kutip spreadsheet", async () => {
    const POST = await muat(WEBHOOK);
    const res = await kirim(POST, { ...LEAD, nama: "=cmd Budi" });
    expect(res.status).toBe(200);
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
    const muatan = JSON.parse((fetchPalsu.mock.calls[0]![1] as RequestInit).body as string);
    expect(muatan.nama).toBe("'=cmd Budi");
    fetchPalsu.mockResolvedValueOnce(new Response(null, { status: 500 }));
    expect((await kirim(POST)).status).toBe(502);
  });

  it("email + webhook: keduanya dipanggil; webhook gagal TIDAK fatal (email = kanal primer)", async () => {
    const POST = await muat({ ...EMAIL_AKTIF, ...WEBHOOK });
    expect((await kirim(POST)).status).toBe(200);
    expect(m.kirimEmailLead).toHaveBeenCalledTimes(1);
    expect(fetchPalsu).toHaveBeenCalledTimes(1);

    fetchPalsu.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    expect((await kirim(POST)).status).toBe(200);
    expect(vi.mocked(console.error).mock.calls.flat().join(" ")).toMatch(/webhook gagal; lead tetap terkirim lewat email/);
  });

  it("email + webhook: email gagal → 502 walau webhook sukses", async () => {
    const POST = await muat({ ...EMAIL_AKTIF, ...WEBHOOK });
    m.kirimEmailLead.mockRejectedValueOnce(new Error("x"));
    expect((await kirim(POST)).status).toBe(502);
    expect(fetchPalsu).toHaveBeenCalledTimes(1);
  });

  it("pagar lama tetap: Origin asing 403, text/plain 415, terlalu cepat 403, invalid 422 — tanpa kiriman", async () => {
    const POST = await muat({ ...EMAIL_AKTIF, ...WEBHOOK });
    const asing = await POST(
      new NextRequest("http://0.0.0.0:3000/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json", host: "bimacreative.tech", origin: "https://evil.example" },
        body: JSON.stringify(LEAD),
      }),
    );
    expect(asing.status).toBe(403);
    const teks = await POST(
      new NextRequest("http://0.0.0.0:3000/api/lead", {
        method: "POST",
        headers: { "content-type": "text/plain", host: "bimacreative.tech", origin: "https://bimacreative.tech" },
        body: JSON.stringify(LEAD),
      }),
    );
    expect(teks.status).toBe(415);
    expect((await kirim(POST, { ...LEAD, sejakDibuka: 500 })).status).toBe(403);
    expect((await kirim(POST, { ...LEAD, pesan: "pendek" })).status).toBe(422);
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
    expect(fetchPalsu).not.toHaveBeenCalled();
  });
});

describe("POST /api/lead — jebakan TIDAK PERNAH diteruskan (G-44), untuk kanal apa pun", () => {
  it("tanpa kanal: jebakan → 503, sama dengan kiriman sah (dicek sebelum jebakan)", async () => {
    const POST = await muat({});
    const sah = await ringkas(await kirim(POST));
    expect(await ringkas(await kirim(POST, { ...LEAD, website: "spam" }))).toEqual(sah);
    expect(sah.status).toBe(503);
  });

  it.each([
    ["email", EMAIL_AKTIF],
    ["webhook", WEBHOOK],
    ["email+webhook", { ...EMAIL_AKTIF, ...WEBHOOK }],
  ])("%s: cincin hangat → jebakan dibalas identik (200 {ok:true}) TANPA kiriman", async (_n, env) => {
    const POST = await muat(env);
    // 1 pengukuran pertama dibuang + CONTOH_MINIMAL (4) → cincin sukses siap.
    for (let i = 0; i < 5; i++) expect((await kirim(POST)).status).toBe(200);
    const sah = await ringkas(await kirim(POST));
    const emailSebelum = m.kirimEmailLead.mock.calls.length;
    const fetchSebelum = fetchPalsu.mock.calls.length;
    const jebakan = await ringkas(await kirim(POST, { ...LEAD, website: "https://spam.example" }));
    expect(jebakan).toEqual(sah);
    expect(m.kirimEmailLead.mock.calls.length).toBe(emailSebelum);
    expect(fetchPalsu.mock.calls.length).toBe(fetchSebelum);
  });

  it("instans dingin: jebakan TIDAK diteruskan (kalibrasi dicabut), jeda dari prior 250–1600 ms", async () => {
    const POST = await muat({ ...EMAIL_AKTIF, ...WEBHOOK });
    for (let i = 0; i < 3; i++) {
      const mulai = performance.now();
      const res = await ringkas(await kirim(POST, { ...LEAD, website: "x" }));
      const lama = performance.now() - mulai;
      expect(res).toEqual({ status: 200, body: { ok: true }, cc: "no-store" });
      expect(lama).toBeGreaterThanOrEqual(240);
      expect(lama).toBeLessThan(1_900);
    }
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
    expect(fetchPalsu).not.toHaveBeenCalled();
  }, 15_000);

  it("M-1: SATU kegagalan nyata (bahkan yang pertama) → jebakan meniru 502, tanpa kiriman", async () => {
    const POST = await muat(EMAIL_AKTIF);
    m.kirimEmailLead.mockRejectedValueOnce(new Error("x"));
    const sah = await ringkas(await kirim(POST));
    expect(sah.status).toBe(502);
    const jebakan = await ringkas(await kirim(POST, { ...LEAD, website: "x" }));
    expect(jebakan).toEqual(sah);
    expect(m.kirimEmailLead).toHaveBeenCalledTimes(1);
  });

  it("M-1: cincin sukses sudah panas lalu SMTP rusak → jebakan ikut 502 sejak kegagalan pertama", async () => {
    const POST = await muat(EMAIL_AKTIF);
    // 5 + 1 + 1 + 1 = 8 = ledakan anggaran (G-42); uji tidak boleh melewatinya.
    for (let i = 0; i < 5; i++) expect((await kirim(POST)).status).toBe(200);
    m.kirimEmailLead.mockRejectedValueOnce(new Error("x"));
    expect((await kirim(POST)).status).toBe(502);
    const n = m.kirimEmailLead.mock.calls.length;
    expect((await kirim(POST, { ...LEAD, website: "x" })).status).toBe(502);
    expect(m.kirimEmailLead.mock.calls.length).toBe(n);
    expect((await kirim(POST)).status).toBe(200); // SMTP pulih → jebakan kembali meniru sukses
  });

  it("webhook gagal: jebakan meniru 502, tanpa fetch", async () => {
    const POST = await muat(WEBHOOK);
    fetchPalsu.mockResolvedValueOnce(new Response(null, { status: 500 }));
    expect((await kirim(POST)).status).toBe(502);
    expect((await kirim(POST, { ...LEAD, website: "x" })).status).toBe(502);
    expect(fetchPalsu).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/lead — anggaran kirim (G-42, H-1)", () => {
  it("atap situs: kiriman sah DAN jebakan memakan jatah yang sama; sesudah habis keduanya 503 identik", async () => {
    const POST = await muat(EMAIL_AKTIF);
    for (let i = 0; i < 5; i++) expect((await kirim(POST)).status).toBe(200); // hangat, 5 token
    for (let i = 0; i < 3; i++) expect((await kirim(POST, { ...LEAD, website: "x" })).status).toBe(200); // 3 token
    const sah = await ringkas(await kirim(POST));
    const jebakan = await ringkas(await kirim(POST, { ...LEAD, website: "x" }));
    expect(sah).toEqual({
      status: 503,
      body: { error: "Form sedang tidak tersedia. Silakan hubungi kami lewat WhatsApp." },
      cc: "no-store",
    });
    expect(jebakan).toEqual(sah);
    expect(m.kirimEmailLead).toHaveBeenCalledTimes(5); // hanya kiriman sah yang jadi surel
  });

  it("atap IP: 3 per hari per IP (sah + jebakan dihitung), IP lain tetap bisa", async () => {
    const POST = await muat(EMAIL_AKTIF);
    const dariIp = (ip: string, body: Record<string, unknown> = LEAD) =>
      POST(
        new NextRequest("http://0.0.0.0:3000/api/lead", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "bimacreative.tech",
            origin: "https://bimacreative.tech",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify(body),
        }),
      );
    // Anggaran situs (ledakan 8) tidak ikut campur: total kiriman lolos di uji ini hanya 4.
    expect((await dariIp("203.0.113.50")).status).toBe(200);
    expect((await dariIp("203.0.113.50", { ...LEAD, website: "x" })).status).toBe(200); // prior
    expect((await dariIp("203.0.113.50")).status).toBe(200);
    const ke4 = await ringkas(await dariIp("203.0.113.50"));
    expect(ke4.status).toBe(503);
    expect(await ringkas(await dariIp("203.0.113.50", { ...LEAD, website: "x" }))).toEqual(ke4);
    expect((await dariIp("203.0.113.51")).status).toBe(200);
    expect(m.kirimEmailLead).toHaveBeenCalledTimes(3);
  }, 10_000);

  it("tanpa kanal (503) tidak memakan anggaran", async () => {
    const POST = await muat({});
    for (let i = 0; i < 12; i++) expect((await kirim(POST)).status).toBe(503);
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
  });
});

describe("POST /api/lead — Turnstile (G-43)", () => {
  const dir = mkdtempSync(join(tmpdir(), "lead-ts-"));
  const berkasRahasia = (isi: string) => {
    const p = join(dir, `${isi.slice(0, 2)}-${Math.random().toString(36).slice(2)}`);
    writeFileSync(p, isi);
    return p;
  };
  const tsEnv = (secret: string) => ({
    ...EMAIL_AKTIF,
    TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    TURNSTILE_SECRET_FILE: berkasRahasia(secret),
  });
  /** fetch: siteverify ditiru, sisanya (webhook) 200. */
  function pasangSiteverify(jawab: (secret: string, token: string) => Record<string, unknown> | Error) {
    fetchPalsu.mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
      if (String(url).includes("/turnstile/v0/siteverify")) {
        const { secret, response } = JSON.parse(String(init?.body));
        const j = jawab(secret, response);
        if (j instanceof Error) throw j;
        return new Response(JSON.stringify(j), { status: 200 });
      }
      return new Response("ok", { status: 200 });
    });
  }
  let tok = 0;
  const denganToken = (extra: Record<string, unknown> = {}) => ({
    ...LEAD,
    "cf-turnstile-response": `tok-${++tok}`,
    ...extra,
  });

  it("kunci uji 1x (selalu lolos) + token → 200 dan surel terkirim", async () => {
    const POST = await muat(tsEnv("1x0000000000000000000000000000000AA"));
    pasangSiteverify((s) => (s.startsWith("1x") ? { success: true, hostname: "example.com" } : { success: false }));
    expect((await kirim(POST, denganToken())).status).toBe(200);
    expect(m.kirimEmailLead).toHaveBeenCalledTimes(1);
  });

  it("token absen / kunci uji 2x (selalu gagal) → 403 generik, SAMA dengan Origin asing; tanpa surel; tanpa memakan anggaran", async () => {
    const POST = await muat(tsEnv("2x0000000000000000000000000000000AA"));
    pasangSiteverify(() => ({ success: false, "error-codes": ["invalid-input-response"] }));
    const tanpa = await ringkas(await kirim(POST));
    const gagal = await ringkas(await kirim(POST, denganToken()));
    const jebakanGagal = await ringkas(await kirim(POST, denganToken({ website: "x" })));
    expect(tanpa).toEqual({
      status: 403,
      body: { error: "Gagal mengirim. Silakan hubungi kami lewat WhatsApp." },
      cc: "no-store",
    });
    expect(gagal).toEqual(tanpa);
    expect(jebakanGagal).toEqual(tanpa);
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
  });

  it("penolakan Turnstile tidak memakan anggaran: 20 gagal lalu 8 lolos berturut-turut", async () => {
    const POST = await muat(tsEnv("0x4AAAAAAAprodpalsu"));
    pasangSiteverify((_s, t) =>
      t.endsWith("-ok") ? { success: true, hostname: "bimacreative.tech", action: "kontak" } : { success: false },
    );
    for (let i = 0; i < 20; i++) expect((await kirim(POST, denganToken())).status).toBe(403);
    for (let i = 0; i < 8; i++) {
      expect((await kirim(POST, { ...LEAD, "cf-turnstile-response": `ok-${i}-ok` })).status).toBe(200);
    }
    expect((await kirim(POST, { ...LEAD, "cf-turnstile-response": "ok-9-ok" })).status).toBe(503);
  });

  it("kunci produksi: hostname lain / action lain → 403", async () => {
    const POST = await muat(tsEnv("0x4AAAAAAAprodpalsu"));
    pasangSiteverify((_s, t) =>
      t === "tok-host"
        ? { success: true, hostname: "evil.example", action: "kontak" }
        : { success: true, hostname: "bimacreative.tech", action: "masuk" },
    );
    expect((await kirim(POST, { ...LEAD, "cf-turnstile-response": "tok-host" })).status).toBe(403);
    expect((await kirim(POST, { ...LEAD, "cf-turnstile-response": "tok-aksi" })).status).toBe(403);
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
  });

  it("siteverify tak terjangkau → fail-closed (503, tanpa surel), token tetap wajib ada", async () => {
    const POST = await muat(tsEnv("0x4AAAAAAAprodpalsu"));
    pasangSiteverify(() => new TypeError("fetch failed"));
    expect((await kirim(POST, denganToken())).status).toBe(503);
    expect((await kirim(POST, { ...denganToken(), website: "http://spam.example" })).status).toBe(503);
    expect(m.kirimEmailLead).not.toHaveBeenCalled();
    expect((await kirim(POST)).status).toBe(403);
  });

  it("Turnstile mati (env kosong): token diabaikan, tidak ada panggilan siteverify", async () => {
    const POST = await muat(EMAIL_AKTIF);
    expect((await kirim(POST, denganToken())).status).toBe(200);
    expect(fetchPalsu).not.toHaveBeenCalled();
  });
});
