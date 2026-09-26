import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Kanal penerusan `/api/lead` (G-41): email SMTP primer + webhook opsional.
 * Mailer di-mock (lib/mailer.ts diuji terpisah di mailer.test.ts), `fetch` di-stub.
 * Tiap uji memuat ulang modul route → rate limit, cincin waktu jebakan, dan cache env segar.
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

describe("POST /api/lead — honeypot tidak berubah (G-19), untuk kanal apa pun", () => {
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
  ])("%s: sesudah kalibrasi, jebakan dibalas identik (200 {ok:true}) TANPA kiriman", async (_n, env) => {
    const POST = await muat(env);
    // 1 pengukuran pertama dibuang + CONTOH_MINIMAL (4) → cincin sukses terkalibrasi.
    for (let i = 0; i < 5; i++) expect((await kirim(POST)).status).toBe(200);
    const sah = await ringkas(await kirim(POST));
    const emailSebelum = m.kirimEmailLead.mock.calls.length;
    const fetchSebelum = fetchPalsu.mock.calls.length;
    const jebakan = await ringkas(await kirim(POST, { ...LEAD, website: "https://spam.example" }));
    expect(jebakan).toEqual(sah);
    expect(m.kirimEmailLead.mock.calls.length).toBe(emailSebelum);
    expect(fetchPalsu.mock.calls.length).toBe(fetchSebelum);
  });

  it("email gagal terus: jebakan meniru 502 dari cincin gagal, tanpa kiriman", async () => {
    const POST = await muat(EMAIL_AKTIF);
    m.kirimEmailLead.mockRejectedValue(new Error("x"));
    for (let i = 0; i < 5; i++) expect((await kirim(POST)).status).toBe(502);
    const sah = await ringkas(await kirim(POST));
    const sebelum = m.kirimEmailLead.mock.calls.length;
    const jebakan = await ringkas(await kirim(POST, { ...LEAD, website: "x" }));
    expect(jebakan).toEqual(sah);
    expect(jebakan.status).toBe(502);
    expect(m.kirimEmailLead.mock.calls.length).toBe(sebelum);
  });

  it("instans dingin: jebakan diteruskan lewat jalur yang SAMA (kalibrasi G-19), kuota tetap berlaku", async () => {
    const POST = await muat(EMAIL_AKTIF);
    const status: number[] = [];
    for (let i = 0; i < 15; i++) status.push((await kirim(POST, { ...LEAD, website: "x" })).status);
    expect(status.every((s) => s === 200)).toBe(true);
    // Atap MAKS_KALIBRASI_JEBAKAN (10) seumur proses — tidak pernah tanpa batas.
    expect(m.kirimEmailLead.mock.calls.length).toBeLessThanOrEqual(10);
  });
});
