import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Endpoint form lead — dikeraskan sesuai SECURITY.md:
 * - Validasi zod ketat (hanya field yang dibutuhkan, UU PDP: minimal data)
 * - Honeypot field "website" (bot mengisinya, manusia tidak melihatnya)
 * - Rate limit sederhana per IP (in-memory; cukup untuk 1 instance)
 * - Tidak menyimpan data — meneruskan ke email/webhook via env
 */

const LeadSchema = z.object({
  nama: z.string().trim().min(2).max(100),
  kontak: z.string().trim().min(5).max(100), // email atau nomor WA
  pesan: z.string().trim().min(10).max(2000),
  produk: z.enum(["bima-insight", "odoo", "web-apps", "lainnya"]).optional(),
  website: z.literal("").optional(), // honeypot — wajib kosong
});

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format tidak valid." }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak lengkap atau tidak valid." }, { status: 422 });
  }
  // Honeypot terisi → pura-pura sukses, jangan beri sinyal ke bot
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nama: parsed.data.nama,
          kontak: parsed.data.kontak,
          pesan: parsed.data.pesan,
          produk: parsed.data.produk ?? "lainnya",
          diterima: new Date().toISOString(),
        }),
      });
    } catch {
      // Jangan bocorkan detail internal ke klien
      return NextResponse.json({ error: "Gagal mengirim. Silakan hubungi kami via WhatsApp." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
