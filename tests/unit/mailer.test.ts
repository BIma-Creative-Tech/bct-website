import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const m = vi.hoisted(() => {
  const sendMail = vi.fn<(opsi: Record<string, unknown>) => Promise<{ messageId: string }>>();
  const close = vi.fn();
  const createTransport = vi.fn<(konfig: Record<string, unknown>) => { sendMail: typeof sendMail; close: typeof close }>(
    () => ({ sendMail, close }),
  );
  return { sendMail, close, createTransport };
});
vi.mock("nodemailer", () => ({ default: { createTransport: m.createTransport } }));

import { parseEnv } from "@/lib/env";
import { EmailLeadError, kirimEmailLead, replyToDari, subjekLead } from "@/lib/mailer";

const dir = mkdtempSync(join(tmpdir(), "bct-mailer-"));
const fileSandi = join(dir, "smtp_password");
writeFileSync(fileSandi, "sandi-uji\n");

function env(port = "587") {
  return parseEnv({
    SITE_URL: "http://localhost",
    CONTACT_ENABLED: "true",
    SMTP_HOST: "mail.contoh.id",
    SMTP_PORT: port,
    SMTP_USER: "web@contoh.id",
    SMTP_FROM_ADDRESS: "no-reply@contoh.id",
    SMTP_PASSWORD_FILE: fileSandi,
  });
}

const LEAD = { nama: "Budi Santoso", kontak: "budi@contoh.id", pesan: "Halo,\nsaya ingin konsultasi Odoo.", produk: "odoo" };

beforeEach(() => {
  m.sendMail.mockReset();
  m.sendMail.mockResolvedValue({ messageId: "x" });
  m.close.mockClear();
  m.createTransport.mockClear();
});

describe("kirimEmailLead", () => {
  it("587: STARTTLS wajib, password dibaca dari file (di-trim), header benar", async () => {
    await kirimEmailLead(env(), "tujuan@contoh.id", LEAD, 1_000);
    const konfig = m.createTransport.mock.calls[0]![0];
    expect(konfig).toMatchObject({
      host: "mail.contoh.id",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: "web@contoh.id", pass: "sandi-uji" },
    });
    expect(konfig).not.toHaveProperty("tls"); // tidak ada rejectUnauthorized:false atau sejenisnya
    const surat = m.sendMail.mock.calls[0]![0];
    expect(surat.from).toBe("no-reply@contoh.id");
    expect(surat.to).toBe("tujuan@contoh.id");
    expect(surat.replyTo).toBe("budi@contoh.id");
    expect(surat.subject).toBe("[Lead bimacreative.tech] odoo — Budi Santoso");
    expect(surat.text).toContain("Nama   : Budi Santoso");
    expect(surat.text).toContain("Kontak : budi@contoh.id");
    expect(surat.text).toContain("Halo,\nsaya ingin konsultasi Odoo.");
    expect(surat).not.toHaveProperty("html");
    expect(m.close).toHaveBeenCalledTimes(1);
  });

  it("465: TLS implisit (secure), tanpa requireTLS", async () => {
    await kirimEmailLead(env("465"), "tujuan@contoh.id", LEAD, 1_000);
    expect(m.createTransport.mock.calls[0]![0]).toMatchObject({ port: 465, secure: true, requireTLS: false });
  });

  it("kontak nomor WA → TANPA Reply-To", async () => {
    await kirimEmailLead(env(), "tujuan@contoh.id", { ...LEAD, kontak: "0812-3456-7890" }, 1_000);
    expect(m.sendMail.mock.calls[0]![0]).not.toHaveProperty("replyTo");
  });

  it("CONTACT_ENABLED=false → EmailLeadError, tidak ada transport", async () => {
    const mati = parseEnv({ SITE_URL: "http://localhost" });
    await expect(kirimEmailLead(mati, "t@contoh.id", LEAD, 1_000)).rejects.toBeInstanceOf(EmailLeadError);
    expect(m.createTransport).not.toHaveBeenCalled();
  });

  it("SMTP gagal → error diteruskan, transport tetap ditutup", async () => {
    m.sendMail.mockRejectedValueOnce(Object.assign(new Error("Invalid login"), { code: "EAUTH" }));
    await expect(kirimEmailLead(env(), "t@contoh.id", LEAD, 1_000)).rejects.toThrow(/Invalid login/);
    expect(m.close).toHaveBeenCalledTimes(1);
  });

  it("melewati tenggat → BATAS_WAKTU, transport diputus", async () => {
    m.sendMail.mockImplementationOnce(() => new Promise(() => {}));
    await expect(kirimEmailLead(env(), "t@contoh.id", LEAD, 20)).rejects.toMatchObject({ kode: "BATAS_WAKTU" });
    expect(m.close).toHaveBeenCalledTimes(1);
  });
});

describe("header aman", () => {
  it("subjek: CR/LF/NEL/U+2028 tidak pernah lolos (injeksi header)", () => {
    const s = subjekLead("Budi\r\nBcc: korban@contoh.id\u0085X: y\u2028Z", "odoo");
    expect(s).not.toMatch(/[\r\n\u0085\u2028]/);
    expect(s).toContain("Budi Bcc: korban@contoh.id X: y Z");
  });

  it("subjek dipotong ≤ 150 karakter", () => {
    expect(subjekLead("x".repeat(500), "lainnya").length).toBeLessThanOrEqual(150);
  });

  it("Reply-To hanya untuk email sah", () => {
    expect(replyToDari("budi@contoh.id")).toBe("budi@contoh.id");
    expect(replyToDari("+62 812 3456 7890")).toBeUndefined();
    expect(replyToDari("budi@contoh.id, lain@contoh.id")).toBeUndefined();
    expect(replyToDari("budi@contoh.id\nBcc: x@y.z")).toBeUndefined();
  });
});
