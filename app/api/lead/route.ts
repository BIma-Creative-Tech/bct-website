import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Endpoint form lead — dikeraskan setelah audit keamanan (G-05).
 *
 * Prinsip yang dijaga:
 * - Validasi zod ketat, hanya field yang dibutuhkan (UU PDP: data minimal).
 * - Tidak menyimpan apa pun; hanya meneruskan ke LEAD_WEBHOOK_URL.
 * - Tidak pernah menulis isi form (nama/kontak/pesan) atau URL webhook ke log.
 * - Respons error generik: tanpa stack, tanpa detail internal, tanpa header CORS.
 * - Situs tidak boleh bilang "terkirim" kalau tidak ada yang menerima.
 *
 * DUA HAL YANG SENGAJA BELUM DIKERJAKAN (menunggu keputusan owner):
 * 1. Penyimpanan rate limit bersama (KV/Redis) — butuh layanan + dependensi baru.
 * 2. Pengerasan tujuan webhook (wajib https + header rahasia) — menyentuh data pribadi.
 */

// ————————————————————————————————————————————————————————————————
// Batas ukuran body
// ————————————————————————————————————————————————————————————————
// `serverActions.bodySizeLimit` di next.config TIDAK berlaku untuk Route Handler
// (hanya untuk Server Actions), jadi batasnya ditegakkan di sini. 16 KB jauh di
// atas kebutuhan form (100 + 100 + 2000 karakter) tapi cukup kecil supaya body
// raksasa tidak pernah ditelan ke memori.
const MAKS_BODY_BYTE = 16 * 1024;

// Batas waktu ke webhook. Tanpa ini satu webhook lambat menahan permintaan
// pengunjung sampai puluhan detik dan ikut menahan slot server.
const BATAS_WAKTU_WEBHOOK_MS = 5_000;

// ————————————————————————————————————————————————————————————————
// Rate limit — dan batas perlindungannya (dibaca apa adanya, bukan jaminan)
// ————————————————————————————————————————————————————————————————
// 1. Penyimpanannya in-memory per instance. Di Vercel setiap instance/region
//    punya Map sendiri, jadi angka di bawah adalah batas PER INSTANCE, bukan
//    batas global situs. Perbaikan sebenarnya = penyimpanan bersama (KV/Redis).
// 2. Kuncinya alamat IP. Satu kantor di belakang NAT berbagi satu ember, dan
//    satu pelanggan IPv6 bisa berganti alamat sesukanya di dalam /64 — karena
//    itu IPv6 dikelompokkan per /64, bukan per alamat.
// 3. Kalau tidak ada hop tepercaya di depan, TIDAK ADA identitas yang bisa
//    dipercaya sama sekali (lihat identitasKlien). Yang tersisa hanya pagar
//    global: itu memperlambat banjir, bukan mencegah spam bertarget.
const JENDELA_MS = 60_000;
const MAKS_PER_IP = 5; // per IP tepercaya, per jendela
const MAKS_TANPA_IDENTITAS = 30; // seluruh trafik tanpa identitas, per jendela
const MAKS_ENTRI = 5_000; // pagar memori untuk Map di bawah

const KUNCI_TANPA_IDENTITAS = "global:tanpa-identitas";

type Identitas = { kunci: string; maks: number };

const hits = new Map<string, { jumlah: number; reset: number }>();

function bersihkanKedaluwarsa(sekarang: number): void {
  for (const [kunci, entri] of hits) {
    if (sekarang > entri.reset) hits.delete(kunci);
  }
}

/**
 * Ambil elemen PALING KANAN dari header berisi daftar hop.
 * Elemen paling kiri ditulis klien dan bisa dikarang bebas — memakainya berarti
 * membiarkan penyerang memilih ember rate limitnya sendiri.
 */
function hopTerdekat(nilai: string | null): string | null {
  if (!nilai) return null;
  const bagian = nilai.split(",");
  const terakhir = bagian[bagian.length - 1]?.trim();
  return terakhir ? terakhir : null;
}

function normalisasiIp(mentah: string | null): string | null {
  if (!mentah) return null;
  let ip = mentah.trim().toLowerCase();
  if (!ip || ip.length > 64) return null;

  const tutup = ip.indexOf("]");
  if (ip.startsWith("[") && tutup > 1) {
    ip = ip.slice(1, tutup); // "[::1]:1234" → "::1"
  } else if (ip.split(":").length === 2) {
    ip = ip.split(":")[0] ?? ip; // "203.0.113.9:1234" → "203.0.113.9"
  }
  if (!ip) return null;

  if (ip.includes(":")) {
    // Kelompokkan IPv6 per /64. Heuristik sederhana: hanya kalau empat hextet
    // pertama memang tertulis lengkap; bentuk terkompresi ("::1") dipakai apa
    // adanya supaya tidak salah kelompok.
    const hextet = ip.split(":");
    if (hextet.length >= 4 && hextet.slice(0, 4).every((h) => h !== "")) {
      return `${hextet.slice(0, 4).join(":")}::/64`;
    }
  }
  return ip;
}

/**
 * Identitas untuk rate limit.
 *
 * X-Forwarded-For, X-Real-IP, dan X-Vercel-Forwarded-For semuanya bisa DITULIS
 * KLIEN. Header itu baru berarti kalau ada proxy tepercaya yang menimpanya
 * sebelum permintaan sampai ke sini. Satu-satunya sinyal yang bisa dipastikan
 * tanpa konfigurasi baru: `VERCEL=1` diset platform Vercel (target deploy per
 * CLAUDE.md), dan di sana edge menimpa header tersebut dengan IP asli.
 *
 * Di luar Vercel (mis. docker-compose yang membuka 3000:3000 langsung) tidak ada
 * hop tepercaya, jadi header sengaja TIDAK dipakai sama sekali: memakainya sama
 * dengan menyerahkan kunci ember kepada penyerang. Sebagai gantinya semua
 * permintaan tanpa identitas masuk ke satu ember global dengan jatah jauh lebih
 * besar (MAKS_TANPA_IDENTITAS), supaya identitas yang tidak diketahui tidak
 * mengunci form untuk semua pengunjung seperti jatah 5/menit sebelumnya.
 *
 * Kalau nanti situs berdiri di belakang proxy sendiri (nginx/Caddy/Cloudflare),
 * jumlah hop tepercaya harus dikonfigurasi eksplisit lewat env yang
 * terdokumentasi — itu keputusan owner, bukan tebakan route ini.
 */
function identitasKlien(req: NextRequest): Identitas {
  if (process.env.VERCEL !== "1") {
    return { kunci: KUNCI_TANPA_IDENTITAS, maks: MAKS_TANPA_IDENTITAS };
  }

  const ip =
    normalisasiIp(hopTerdekat(req.headers.get("x-vercel-forwarded-for"))) ??
    normalisasiIp(req.headers.get("x-real-ip")) ??
    normalisasiIp(hopTerdekat(req.headers.get("x-forwarded-for")));

  return ip
    ? { kunci: `ip:${ip}`, maks: MAKS_PER_IP }
    : { kunci: KUNCI_TANPA_IDENTITAS, maks: MAKS_TANPA_IDENTITAS };
}

function konsumsiKuota(identitas: Identitas): { boleh: boolean; tungguDetik: number } {
  const sekarang = Date.now();
  let kunci = identitas.kunci;
  let maks = identitas.maks;

  if (!hits.has(kunci) && hits.size >= MAKS_ENTRI) {
    bersihkanKedaluwarsa(sekarang);
    if (!hits.has(kunci) && hits.size >= MAKS_ENTRI) {
      // Map penuh: jangan biarkan tumbuh tanpa batas (itu jalur habisnya memori).
      // Identitas baru menumpang ember global sampai jendela bergulir.
      kunci = KUNCI_TANPA_IDENTITAS;
      maks = MAKS_TANPA_IDENTITAS;
    }
  }

  const entri = hits.get(kunci);
  if (!entri || sekarang > entri.reset) {
    hits.set(kunci, { jumlah: 1, reset: sekarang + JENDELA_MS });
    return { boleh: true, tungguDetik: 0 };
  }

  entri.jumlah += 1;
  if (entri.jumlah <= maks) return { boleh: true, tungguDetik: 0 };
  return { boleh: false, tungguDetik: Math.max(1, Math.ceil((entri.reset - sekarang) / 1000)) };
}

// ————————————————————————————————————————————————————————————————
// Pembersihan isi form
// ————————————————————————————————————————————————————————————————
// Field satu baris: karakter kontrol dibuang (jadi spasi). CR/LF di `nama` dan
// `kontak` adalah bahan injeksi header email ("\r\nBcc: ...") begitu isinya
// dipakai untuk menyusun email di sisi penerima. Rentang C1 (U+0080–U+009F)
// ikut dibuang: NEL (U+0085) dilipat seperti baris baru oleh sebagian parser
// yang longgar, jadi "korban@x.com\u0085Bcc: ..." adalah vektor yang sama.
const KONTROL_SATU_BARIS = /[\u0000-\u001F\u007F-\u009F\u2028\u2029]+/g;
// Field pesan boleh punya baris baru (wajar untuk cerita panjang): CRLF/CR
// dinormalkan jadi LF, TAB dan LF dipertahankan, karakter kontrol lain
// (termasuk C1) tetap dibuang.
const AKHIR_BARIS = /\r\n?/g;
const KONTROL_PESAN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u2028\u2029]+/g;
// Karakter tak terlihat: soft hyphen, penanda arah bidi (embedding/override/
// isolate) dan keluarga zero-width. DIHAPUS, bukan diganti spasi, karena
// keduanya dipakai untuk menipu mata dan pagar:
// 1. Spoofing tampilan — "Ade\u202Enimda" terbaca "Adenimda" di inbox/Sheet owner.
// 2. Penyamaran awalan formula — "\u200B=cmd|'/c calc'!A1" lolos uji karakter
//    pertama padahal spreadsheet mengabaikan ZWSP dan tetap mengeksekusi selnya.
// ZWNJ/ZWJ ikut dibuang: di form lead teks polos keduanya tidak punya fungsi
// selain menyembunyikan sesuatu (kerugian terburuk: rangkaian emoji terpecah).
const TAK_TERLIHAT =
  /[\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
const AWALAN_FORMULA = /^[=+@-]/;

function satuBaris(min: number, maks: number) {
  return z
    .string()
    .max(4_000) // pagar kasar sebelum transform; batas sebenarnya di bawah
    .transform((nilai) => nilai.replace(TAK_TERLIHAT, "").replace(KONTROL_SATU_BARIS, " "))
    .pipe(z.string().trim().min(min).max(maks));
}

function banyakBaris(min: number, maks: number) {
  return z
    .string()
    .max(8_000)
    .transform((nilai) =>
      nilai.replace(AKHIR_BARIS, "\n").replace(TAK_TERLIHAT, "").replace(KONTROL_PESAN, " "),
    )
    .pipe(z.string().trim().min(min).max(maks));
}

/**
 * Google Sheets/Excel mengeksekusi isi sel yang diawali `=`, `+`, `-`, atau `@`
 * (mis. `=HYPERLINK(...)`, `+cmd|'/c calc'!A1`) begitu owner membuka lembar
 * leadnya. Awalan kutip tunggal memaksa sel dibaca sebagai teks.
 *
 * Diterapkan PER BARIS, bukan sekali di depan seluruh string. `pesan` sengaja
 * boleh multi-baris, dan sink lead yang lazim (Apps Script/n8n → Sheets) memecah
 * pesan menjadi beberapa sel. Menjaga karakter pertama string saja berarti
 * `=HYPERLINK(...)` di baris kedua sampai mentah ke selnya sendiri.
 *
 * Spasi/tab di depan baris yang ditandai ikut dibuang: kalau kutip diletakkan
 * sebelum indentasi ("'  =HYPERLINK(...)"), sink yang mem-trim tiap sel akan
 * membuang kutipnya lagi dan formulanya hidup kembali.
 *
 * Bentuk keluaran ini dipilih karena tidak merusak pesan wajar — baris baru dan
 * teksnya utuh, hanya baris pemicu yang dapat satu kutip di depan. Di sink
 * Sheets (USER_ENTERED) kutip itu justru tidak ikut tampil; di sink RAW/email
 * kutipnya terlihat, tapi di sana formula memang tidak pernah dieksekusi. Jadi
 * satu-satunya noise jatuh pada tujuan yang paling tidak berisiko.
 *
 * Sengaja dilakukan saat MENERUSKAN, bukan saat validasi: yang divalidasi tetap
 * apa yang benar-benar diketik pengunjung, dan escape ini urusan format tujuan.
 */
function amanUntukSpreadsheet(nilai: string): string {
  return nilai
    .split("\n")
    .map((baris) => {
      const tanpaSpasiDepan = baris.trimStart();
      return AWALAN_FORMULA.test(tanpaSpasiDepan) ? `'${tanpaSpasiDepan}` : baris;
    })
    .join("\n");
}

// ————————————————————————————————————————————————————————————————
// Skema
// ————————————————————————————————————————————————————————————————
const LeadSchema = z.object({
  nama: satuBaris(2, 100),
  kontak: satuBaris(5, 100), // email atau nomor WA
  pesan: banyakBaris(10, 2_000),
  // Harus persis sama dengan `OpsiProduk` di content/copy/kontak.ts.
  produk: z.enum(["bima-insight", "odoo", "web-apps", "lainnya"]).optional(),
  // Honeypot "website". SENGAJA menerima nilai apa pun: skema yang menolak
  // isian bot (dulu `z.literal("")`) membalas 422 dan langsung memberitahu bot
  // field mana jebakannya — sekali coba, jebakan hangus. Nilainya diperiksa
  // setelah validasi, di titik yang balasannya sama persis dengan kiriman sah.
  website: z.unknown().optional(),
});

function honeypotTerisi(nilai: unknown): boolean {
  if (nilai === undefined || nilai === null) return false;
  if (typeof nilai === "string") return nilai.trim() !== "";
  return true; // tipe apa pun selain string kosong: bukan pengunjung normal
}

// ————————————————————————————————————————————————————————————————
// Baca body dengan batas
// ————————————————————————————————————————————————————————————————
type HasilBody = { ok: true; teks: string } | { ok: false; alasan: "besar" | "rusak" };

async function bacaBodyTerbatas(req: NextRequest): Promise<HasilBody> {
  // Jalur cepat: klien menyatakan sendiri ukurannya.
  const dinyatakan = Number(req.headers.get("content-length"));
  if (Number.isFinite(dinyatakan) && dinyatakan > MAKS_BODY_BYTE) {
    return { ok: false, alasan: "besar" };
  }

  // Content-Length bisa hilang (transfer-encoding: chunked) atau bohong, jadi
  // ukuran sebenarnya tetap dihitung sambil membaca dan dipotong di batas.
  const stream = req.body;
  if (!stream) return { ok: true, teks: "" };

  const pembaca = stream.getReader();
  const dekoder = new TextDecoder("utf-8");
  let teks = "";
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await pembaca.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAKS_BODY_BYTE) {
        await pembaca.cancel().catch(() => undefined);
        return { ok: false, alasan: "besar" };
      }
      teks += dekoder.decode(value, { stream: true });
    }
    teks += dekoder.decode();
    return { ok: true, teks };
  } catch {
    return { ok: false, alasan: "rusak" }; // koneksi putus di tengah jalan
  } finally {
    pembaca.releaseLock();
  }
}

// ————————————————————————————————————————————————————————————————
// Handler
// ————————————————————————————————————————————————————————————————
function balas(
  data: Record<string, unknown>,
  status: number,
  headerTambahan?: Record<string, string>,
) {
  return NextResponse.json(data, {
    status,
    headers: { "cache-control": "no-store", ...headerTambahan },
  });
}

const PESAN_GAGAL = "Gagal mengirim. Silakan hubungi kami lewat WhatsApp.";

export async function POST(req: NextRequest) {
  const kuota = konsumsiKuota(identitasKlien(req));
  if (!kuota.boleh) {
    return balas({ error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." }, 429, {
      "retry-after": String(kuota.tungguDetik),
    });
  }

  const body = await bacaBodyTerbatas(req);
  if (!body.ok) {
    return body.alasan === "besar"
      ? balas({ error: "Pesan terlalu besar." }, 413)
      : balas({ error: "Format tidak valid." }, 400);
  }

  let mentah: unknown;
  try {
    mentah = JSON.parse(body.teks);
  } catch {
    return balas({ error: "Format tidak valid." }, 400);
  }

  const parsed = LeadSchema.safeParse(mentah);
  if (!parsed.success) {
    return balas({ error: "Data tidak lengkap atau tidak valid." }, 422);
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    // Tanpa tujuan, lead hilang senyap. Jangan pernah membalas {ok:true} di sini —
    // halaman kontak menjanjikan "Pesan Anda terkirim."
    //
    // Diperiksa SEBELUM cabang honeypot supaya bot tidak bisa membedakan jebakan
    // dari kiriman biasa hanya dengan melihat 503 vs 200.
    return balas({ error: "Form sedang tidak tersedia. Silakan hubungi kami lewat WhatsApp." }, 503);
  }

  if (honeypotTerisi(parsed.data.website)) {
    // Terperangkap: balas persis seperti kiriman sukses, tapi TIDAK meneruskan
    // apa pun ke webhook.
    return balas({ ok: true }, 200);
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(BATAS_WAKTU_WEBHOOK_MS),
      body: JSON.stringify({
        nama: amanUntukSpreadsheet(parsed.data.nama),
        kontak: amanUntukSpreadsheet(parsed.data.kontak),
        pesan: amanUntukSpreadsheet(parsed.data.pesan),
        produk: parsed.data.produk ?? "lainnya",
        diterima: new Date().toISOString(),
      }),
    });

    // Balasan webhook tidak dipakai — lepaskan koneksinya, jangan digantung.
    await res.body?.cancel().catch(() => undefined);

    if (!res.ok) {
      // Hanya status; JANGAN pernah mencatat isi form atau URL webhook (URL bisa
      // memuat token rahasia).
      console.error(`[lead] webhook menolak kiriman, status ${res.status}`);
      return balas({ error: PESAN_GAGAL }, 502);
    }
  } catch {
    console.error("[lead] webhook tidak terjangkau atau melewati batas waktu");
    return balas({ error: PESAN_GAGAL }, 502);
  }

  return balas({ ok: true }, 200);
}
