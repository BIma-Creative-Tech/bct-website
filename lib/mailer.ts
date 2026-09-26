import "server-only";
import { readFile } from "node:fs/promises";
import nodemailer from "nodemailer";
import { z } from "zod";
import type { Env } from "@/lib/env";

/**
 * Kanal EMAIL lead `/api/lead` (ADR 2026-09-26 "Form kontak: email SMTP primer + webhook
 * opsional", G-41). Port `src/lib/mailer.ts` web-starter:
 * - Password dibaca dari SMTP_PASSWORD_FILE saat kirim (secret mount), tidak pernah dari env,
 *   tidak pernah di-log.
 * - TLS wajib: port 465 → TLS implisit; port lain → STARTTLS wajib (`requireTLS`). Sertifikat
 *   server selalu diverifikasi (bawaan nodemailer) — TIDAK ada jalan pintas untuk menonaktifkannya.
 * - Teks polos saja → tidak ada risiko HTML injection di klien email penerima.
 *
 * Beda dari web-starter:
 * - Form BCT menerima "kontak" = nomor WA ATAU email. Reply-To hanya diisi bila kontaknya email
 *   sah; nomor WA tidak pernah dijadikan header.
 * - Subjek dibersihkan ulang dari karakter kontrol (pertahanan berlapis; skema zod route sudah
 *   membuangnya) dan dipotong — injeksi header lewat subjek tertutup dua lapis.
 * - Ada tenggat total (`batasWaktuMs`): route harus membalas pengunjung dalam waktu terbatas,
 *   dan timeout per fase nodemailer bisa menumpuk. Saat tenggat lewat transport ditutup
 *   (koneksi SMTP diputus sebelum DATA selesai → tidak ada kiriman setengah jadi yang diklaim).
 */

export type LeadEmail = {
  nama: string;
  kontak: string;
  pesan: string;
  produk: string;
};

/** Error dengan `name` tetap, supaya log route bisa mencatat jenisnya tanpa isi apa pun. */
export class EmailLeadError extends Error {
  constructor(public readonly kode: "TIDAK_DIKONFIGURASI" | "BATAS_WAKTU") {
    super(kode);
    this.name = "EmailLeadError";
  }
}

const KONTROL = /[\u0000-\u001F\u007F-\u009F\u2028\u2029]+/g;
const MAKS_SUBJEK = 150;

/** Subjek satu baris tanpa karakter kontrol (CR/LF/NEL = bahan injeksi header). */
export function subjekLead(nama: string, produk: string): string {
  const bersih = `[Lead bimacreative.tech] ${produk} — ${nama}`.replace(KONTROL, " ").replace(/\s+/g, " ").trim();
  return bersih.length > MAKS_SUBJEK ? `${bersih.slice(0, MAKS_SUBJEK - 1)}…` : bersih;
}

const EmailSah = z.email();

/** Reply-To = kontak pengunjung HANYA bila ia alamat email sah; selain itu tidak ada Reply-To. */
export function replyToDari(kontak: string): string | undefined {
  return EmailSah.safeParse(kontak).success ? kontak : undefined;
}

export function teksLead(lead: LeadEmail): string {
  return [
    `Nama   : ${lead.nama}`,
    `Kontak : ${lead.kontak}`,
    `Produk : ${lead.produk}`,
    "",
    lead.pesan,
    "",
    "—",
    "Dikirim otomatis dari form /kontak. Balas langsung ke pengunjung lewat kontak di atas.",
  ].join("\n");
}

export async function kirimEmailLead(
  env: Env,
  to: string,
  lead: LeadEmail,
  batasWaktuMs: number,
): Promise<void> {
  if (!env.CONTACT_ENABLED || !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_FROM_ADDRESS || !env.SMTP_PASSWORD_FILE) {
    throw new EmailLeadError("TIDAK_DIKONFIGURASI");
  }
  const pass = (await readFile(env.SMTP_PASSWORD_FILE, "utf8")).trim();
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    requireTLS: env.SMTP_PORT !== 465,
    auth: { user: env.SMTP_USER, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const replyTo = replyToDari(lead.kontak);
  let penanda: ReturnType<typeof setTimeout> | undefined;
  const tenggat = new Promise<never>((_, tolak) => {
    penanda = setTimeout(() => tolak(new EmailLeadError("BATAS_WAKTU")), batasWaktuMs);
  });
  try {
    await Promise.race([
      transport.sendMail({
        from: env.SMTP_FROM_ADDRESS,
        to,
        ...(replyTo ? { replyTo } : {}),
        subject: subjekLead(lead.nama, lead.produk),
        text: teksLead(lead),
      }),
      tenggat,
    ]);
  } finally {
    clearTimeout(penanda);
    transport.close();
  }
}
