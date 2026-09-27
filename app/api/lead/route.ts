import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buatAnggaran } from "@/lib/anggaran-kirim";
import { clientIpFrom } from "@/lib/client-ip";
import { getEnv, turnstileAktif, type Env } from "@/lib/env";
import { PENERIMA_LEAD } from "@/lib/lead-recipient";
import { kirimEmailLead } from "@/lib/mailer";
import { periksaTurnstile } from "@/lib/turnstile";
import { AKSI_PEMERIKSAAN, ANGGARAN_KIRIM, BATAS_ISIAN } from "./batas";

/**
 * Endpoint form lead — dikeraskan setelah audit keamanan (G-05).
 *
 * Prinsip yang dijaga:
 * - Validasi zod ketat, hanya field yang dibutuhkan (UU PDP: data minimal).
 * - Tidak menyimpan apa pun; hanya MENERUSKAN (ADR 2026-09-26 "Form kontak: email SMTP primer +
 *   webhook opsional", G-41) ke:
 *     1. EMAIL via SMTP (kanal PRIMER) bila CONTACT_ENABLED=true → PENERIMA_LEAD
 *        (lib/lead-recipient.ts, server-only); dan/atau
 *     2. LEAD_WEBHOOK_URL (kanal TAMBAHAN, opsional) — kode lama, apa adanya.
 *   Aturan sukses (lihat `teruskanLead`): email aktif → sukses HANYA bila email terkirim
 *   (webhook gagal dicatat di log, tidak fatal); hanya webhook → sukses bila webhook 2xx;
 *   tidak ada kanal → 503 (ADR 2026-08-25).
 * - Di seluruh mesin waktu jebakan di bawah, kata "webhook"/"panggilan webhook" berarti
 *   PENERUSAN LEAD SELURUHNYA (semua kanal yang aktif, berjalan paralel) — itulah yang
 *   diukur cincin dan ditiru cabang jebakan, jadi waktu jebakan mengikuti kanal apa pun
 *   yang aktif tanpa kode khusus per kanal.
 * - Tidak pernah menulis isi form (nama/kontak/pesan) atau URL webhook ke log.
 * - Respons error generik: tanpa stack, tanpa detail internal, tanpa header CORS.
 * - Situs tidak boleh bilang "terkirim" kalau tidak ada yang menerima.
 * - Jebakan bot tidak boleh bisa dikenali dari LUAR — bukan hanya status/body/header,
 *   tapi juga waktu respons (G-19).
 *
 * URUTAN PAGAR (penting — lihat `POST`): Origin → content-type → rate limit per menit →
 * body/zod → ambang waktu isi → kanal ada? → Turnstile (G-43, bila aktif) → ANGGARAN KIRIM
 * (G-42: situs 20/jam + ledakan 8, IP 3/hari) → cabang jebakan / penerusan nyata. Turnstile
 * SEBELUM anggaran: token yang gagal tidak pernah memakan jatah surel. Anggaran SEBELUM cabang
 * jebakan: jebakan dan kiriman sah memakan jatah yang sama di titik yang sama.
 *
 * DUA HAL YANG SENGAJA BELUM DIKERJAKAN (menunggu keputusan owner):
 * 1. Penyimpanan rate limit/anggaran bersama (KV/Redis) — butuh layanan + dependensi baru (G-16).
 * 2. Pengerasan tujuan webhook (wajib https + header rahasia) — menyentuh data pribadi.
 * (Captcha G-20b kini ada: Cloudflare Turnstile opsional, G-43.)
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

// Tenggat total kanal email (koneksi + STARTTLS + AUTH + DATA). Lebih longgar daripada
// webhook karena SMTP butuh beberapa putaran; lewat tenggat → transport diputus, dibalas 502.
const BATAS_WAKTU_EMAIL_MS = 10_000;

// ————————————————————————————————————————————————————————————————
// Bentuk permintaan (G-20a) — Origin, content-type, ambang waktu isi form
// ————————————————————————————————————————————————————————————————
// Latar: security-auditor membuktikan skrip 22 baris mengirim 12 lead palsu dalam
// 2,6 detik lewat halaman nyata, dan POST `text/plain` lintas origin dibalas 200.
// Artinya penyerang bisa menanam pengirim di situs mana pun dan memakai IP ASLI
// pengunjung situs itu — rate limit per-IP dilewati tanpa satu pun proxy.
//
// Tiga pagar di bawah menutup jalur itu TANPA dependensi baru. Semuanya sengaja
// murah dan tidak menyentuh data pribadi. Yang mahal (captcha) = gerbang owner.
//
// PRINSIP YANG MENGIKAT KETIGANYA: menolak satu pengunjung sah lebih mahal
// daripada meloloskan satu spam. Setiap pagar di bawah dipilih pada sisi longgar
// bila ada keraguan, dan alasannya ditulis di tempat.

/**
 * Ambang waktu minimum antara halaman /kontak terbuka dan kiriman berangkat.
 *
 * Angkanya (3 detik) dipilih dari dua arah:
 * - Batas bawah manusia: form ini mewajibkan nama (≥2), kontak (≥5), dan cerita
 *   (≥10 karakter). Memuat halaman, mengisi tiga kontrol, lalu menekan kirim di
 *   bawah 3 detik tidak mungkin diketik; bahkan menempel tiga kali pun lebih lama.
 * - Batas atas serangan: skrip auditor menyelesaikan 12 kiriman dalam 2,6 detik
 *   (±215 ms per kiriman). 3 detik membuat pola itu mustahil apa adanya.
 * Sengaja TIDAK dinaikkan ke 8–15 detik: bot cukup menunggu, sementara setiap
 * detik tambahan menambah peluang menolak manusia yang menempel isian dengan
 * cepat — dan itu kerugian yang tidak bisa ditebus.
 *
 * Nilainya dilaporkan klien (`sejakDibuka`, diukur `performance.now()` di browser),
 * jadi BISA dipalsukan oleh siapa pun yang membaca bundel JS. Itu memang batasnya:
 * pagar ini menaikkan biaya otomasi naif, bukan membuktikan kemanusiaan. Yang
 * membuktikan = captcha: Cloudflare Turnstile opsional (G-20b → G-43).
 */
const AMBANG_ISI_MS = 3_000;

/** Atap `sejakDibuka` yang dilaporkan klien; di atas ini angkanya dipotong. */
const ATAP_SEJAK_DIBUKA_MS = 30 * 24 * 60 * 60 * 1_000;

/** Satu-satunya content-type yang diterima. */
const TIPE_ISI_WAJIB = "application/json";

/**
 * Kumpulan host yang dianggap "situs ini".
 *
 * `X-Forwarded-Host` DIBUANG (koreksi 2026-08-26, audit ulang G-20). Auditor
 * membuktikan lewat soket mentah bahwa `Host: <asli>` + `X-Forwarded-Host: evil.com`
 * + `Origin: evil.com` dibalas 200 — header itu ditulis KLIEN dan tidak ada satu pun
 * hop tepercaya yang menimpanya di jalur deploy proyek ini, jadi memakainya sama
 * dengan mengizinkan penyerang menambahkan origin ke daftar putih. Di deploy VPS
 * (ADR 2026-09-26) Traefik meneruskan `Host` asli (passHostHeader bawaan) dan mengisi
 * `X-Forwarded-Host` dengan nilai yang sama, jadi header itu tidak menambah apa pun —
 * `Host` saja tetap cukup, dan route ini tidak bergantung pada perilaku penulisan ulang
 * header yang tidak bisa diuji tanpa Traefik.
 *
 * `Host` DIPERTAHANKAN — sengaja, dan bukan karena ia lebih aman:
 * - Untuk serangan yang jadi alasan pagar ini (skrip di situs lain memakai peramban
 *   + IP pengunjung) `Host` TIDAK bisa dikarang: peramban mengisinya sendiri dengan
 *   tujuan sebenarnya, dan ia forbidden header name untuk skrip. `X-Forwarded-Host`
 *   juga tidak bisa dikirim skrip lintas origin, tapi ia tidak menambah satu pun
 *   kasus sah yang tidak sudah tertutup `Host` — jadi membuangnya murni pengetatan.
 * - Menyandarkan diri pada `req.nextUrl.host` SAJA (saran auditor) akan MEMATIKAN
 *   form di sebagian besar deploy non-Vercel. Terukur di repo ini pada `next start`:
 *   `nextUrl.host` = alamat bind server (`localhost:3210`), BUKAN host yang diminta
 *   pengunjung — jadi situs yang sama di balik nginx/Caddy pada `bct.co.id` akan
 *   membandingkan `Origin: https://bct.co.id` dengan `localhost:3000` dan membalas
 *   403 untuk SETIAP pengunjung. (Di Vercel `nextUrl.host` justru berasal dari
 *   header `Host` yang sama, jadi tidak ada bedanya di sana.) Repo ini mengirim
 *   image ke GHCR dan punya docker-compose, jadi jalur self-host bukan hipotesis.
 * - Klien non-peramban (curl) memang masih bisa mengarang `Host` DAN `Origin`
 *   sekaligus, dan itu memang bukan yang ditutup pagar ini — permintaan seperti itu
 *   memakai IP penyerang sendiri dan berhadapan dengan rate limit. Menutupnya
 *   menuntut host kanonik yang dikonfigurasi eksplisit lewat env; itu keputusan
 *   owner (butuh nilai berbeda untuk dev, preview, dan production), bukan tebakan
 *   route ini.
 */
function hostSitusIni(req: NextRequest): Set<string> {
  const daftar = [req.headers.get("host"), req.nextUrl.host];
  const hasil = new Set<string>();
  for (const nilai of daftar) {
    const host = nilai?.trim().toLowerCase();
    if (host) hasil.add(host);
  }
  return hasil;
}

/**
 * Kumpulan origin lengkap (skema + host + port) yang dianggap "situs ini".
 *
 * Membandingkan `host` saja mengabaikan skema, sehingga `https://<host-kita>`
 * diterima walau situsnya berjalan `http://` (temuan LOW G-20). Sekarang yang
 * dibandingkan `URL.origin`, yang membawa skema.
 *
 * SATU KELONGGARAN YANG DISENGAJA: bila permintaan ini sendiri terlihat `http:`,
 * `https://<host-yang-sama>` tetap diterima. Alasannya:
 * - Skema situs hanya bisa diketahui dari `X-Forwarded-Proto` (itulah yang dibaca
 *   `nextUrl.protocol`), dan header itu ditulis klien kalau tidak ada proxy
 *   tepercaya. Proxy TLS yang lupa menyetelnya adalah salah konfigurasi yang lazim
 *   — dan akibat menolak di situ adalah form mati untuk semua pengunjung.
 * - Menerimanya tidak membuka jalur lintas SITUS: host tetap harus cocok persis.
 *   Penyerang yang bisa menyajikan halaman dari `https://<host-kita>` sudah
 *   menguasai domain kita, dan pagar Origin bukan lagi yang menahannya.
 * Kelonggarannya searah: situs yang berjalan `https:` TIDAK menerima origin `http:`.
 */
function asalSitusIni(req: NextRequest): Set<string> {
  const skema = req.nextUrl.protocol === "https:" ? "https:" : "http:";
  const hasil = new Set<string>();
  for (const host of hostSitusIni(req)) {
    hasil.add(`${skema}//${host}`);
    if (skema === "http:") hasil.add(`https://${host}`);
  }
  return hasil;
}

/**
 * "Permintaan ini datang dari halaman milik orang lain."
 *
 * KEPUTUSAN DESAIN — `Origin` ABSEN DITERIMA, BUKAN DITOLAK:
 * - Peramban WAJIB mengirim `Origin` pada setiap permintaan lintas origin, dan
 *   pada POST bahkan ketika satu origin. Serangan yang jadi alasan pagar ini
 *   (skrip di situs lain memakai peramban + IP pengunjung) karena itu SELALU
 *   membawa `Origin` asing, dan skrip tidak bisa menghapus atau memalsukannya —
 *   `Origin` adalah forbidden header name.
 * - Sebaliknya, `Origin` bisa hilang pada permintaan yang SAH: sebagian ekstensi
 *   privasi dan proxy korporat memangkas header, dan peramban lama tidak selalu
 *   mengirimnya pada POST satu origin.
 * - Jadi menolak yang absen tidak menutup satu pun jalur serangan berbasis
 *   peramban, tapi berpotensi mematikan form untuk pengunjung sungguhan. Yang
 *   tersisa (curl/skrip server tanpa `Origin`) memakai IP penyerang sendiri dan
 *   sudah berhadapan dengan rate limit + ambang waktu di atas.
 * - `Origin: null` DITOLAK. Nilai itu berarti origin opaque — iframe ber-sandbox,
 *   `data:`/`blob:`, atau redirect lintas origin — dan itu persis cara termudah
 *   menyembunyikan asal serangan (`<iframe sandbox>` + fetch). Pengunjung sungguhan
 *   di /kontak tidak pernah berada dalam konteks opaque, karena halamannya dilarang
 *   di-iframe sama sekali (`frame-ancestors 'none'` + `X-Frame-Options: DENY` di
 *   next.config.ts).
 */
function asalAsing(req: NextRequest): boolean {
  const asal = req.headers.get("origin");
  if (asal === null) return false; // absen → diterima; alasan di atas
  if (asal === "null") return true; // origin opaque → tolak

  let origin: string;
  try {
    origin = new URL(asal).origin.toLowerCase();
  } catch {
    return true; // bukan URL sah: hanya klien yang mengarang header yang begini
  }
  // `URL.origin` = "null" untuk skema non-tuple (mis. `data:`, `file:`).
  if (!origin || origin === "null") return true;
  return !asalSitusIni(req).has(origin);
}

// ————————————————————————————————————————————————————————————————
// Rate limit — dan batas perlindungannya (dibaca apa adanya, bukan jaminan)
// ————————————————————————————————————————————————————————————————
// 1. Penyimpanannya in-memory per instance. Deploy VPS = satu container per situs
//    (ADR 2026-09-26), jadi angka di bawah = batas situs selama replika tetap 1;
//    bila di-scale >1 replika, perbaikan sebenarnya = penyimpanan bersama (G-16).
// 2. Kuncinya alamat IP. Satu kantor di belakang NAT berbagi satu ember, dan
//    satu pelanggan IPv6 bisa berganti alamat sesukanya di dalam /64 — karena
//    itu IPv6 dikelompokkan per /64, bukan per alamat.
// 3. Identitas hanya bisa dipercaya karena Traefik adalah hop tepercaya di depan
//    container (lihat lib/client-ip.ts). Permintaan tanpa IP sah masuk pagar
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
 * GANTI DOKTRIN 2026-09-26 (ADR "Deploy VPS di belakang Traefik"): jalur kepercayaan
 * `VERCEL === "1"` + `x-vercel-forwarded-for` DIBUANG — situs tidak lagi di Vercel, dan
 * flag itu berbahaya bila diset manual (G-12). Penggantinya `clientIpFrom()`
 * (lib/client-ip.ts, pola web-starter): entri `X-Forwarded-For` PALING KANAN, yang
 * ditulis ulang Traefik dari alamat soket peer (entrypoint tanpa `trustedIPs` → header
 * kiriman klien dibuang), fallback `X-Real-Ip`. Syaratnya kontrak deploy: container
 * tanpa port publik, hanya dijangkau lewat Traefik.
 *
 * Tanpa IP sah (header tidak ada / bukan IP) → satu ember global dengan jatah jauh
 * lebih besar (MAKS_TANPA_IDENTITAS), supaya identitas yang tidak diketahui tidak
 * mengunci form untuk semua pengunjung.
 */
function identitasKlien(req: NextRequest): Identitas {
  const ip = normalisasiIp(clientIpFrom(req.headers));
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
// Angka batasnya ada di ./batas.ts, BUKAN di sini: form /kontak memakai angka yang
// sama persis untuk minLength, pemeriksaan panjang di browser, dan pengisian token
// {maks} di copy. (maxLength sengaja tidak dipakai — lihat aturan 8 di form-kontak.tsx.)
// Dua salinan angka = klien dan server melenceng diam-diam. Berkasnya sengaja
// terpisah dari route ini supaya form tidak ikut menarik zod + next/server ke
// bundel browser (alasan lengkap ada di ./batas.ts).
const LeadSchema = z.object({
  nama: satuBaris(BATAS_ISIAN.nama.min, BATAS_ISIAN.nama.maks),
  kontak: satuBaris(BATAS_ISIAN.kontak.min, BATAS_ISIAN.kontak.maks), // email atau nomor WA
  pesan: banyakBaris(BATAS_ISIAN.pesan.min, BATAS_ISIAN.pesan.maks),
  // Harus persis sama dengan `OpsiProduk` di content/copy/kontak.ts.
  produk: z.enum(["bima-insight", "odoo", "web-apps", "lainnya"]).optional(),
  // Honeypot "website". SENGAJA menerima nilai apa pun: skema yang menolak
  // isian bot (dulu `z.literal("")`) membalas 422 dan langsung memberitahu bot
  // field mana jebakannya — sekali coba, jebakan hangus. Nilainya diperiksa
  // setelah validasi, di titik yang balasannya sama persis dengan kiriman sah
  // (termasuk pada sumbu waktu — lihat `jedaSeolahDiteruskan`).
  // Nama field di kabel tetap "website" dan tidak boleh diubah tanpa mengubah
  // form; yang diganti pada G-19b adalah nama KUNCI COPY di sisi klien, karena
  // kunci itulah yang ikut terbit ke HTML lewat muatan RSC.
  website: z.unknown().optional(),
  // Berapa lama halaman /kontak sudah terbuka saat kiriman berangkat, dalam ms
  // (`performance.now()` di browser). Dipakai ambang `AMBANG_ISI_MS`; nilainya
  // laporan klien, jadi tidak dipercaya sebagai bukti — hanya sebagai pagar.
  //
  // DIPOTONG, BUKAN DITOLAK (koreksi 2026-08-26, audit ulang G-20). Sebelumnya
  // `.max(30 hari)`: tab yang dibiarkan terbuka lebih dari 30 hari membuat isian
  // yang sempurna dibalas 422 "Data tidak lengkap atau tidak valid" — pesan yang
  // keliru dan tidak bisa diperbaiki pengunjung selain memuat ulang halaman.
  // Nilainya cuma dipakai untuk satu perbandingan `< AMBANG_ISI_MS`, jadi semua
  // angka di atas ambang setara; memotongnya membuang angka konyol tanpa pernah
  // menolak kiriman.
  // Token Cloudflare Turnstile (G-43). `unknown`, bukan string ber-batas: bentuk yang salah
  // ditolak `periksaTurnstile` dengan balasan yang sama dengan token gagal (403), bukan 422 —
  // supaya tidak ada status khusus untuk "tokennya cacat". Diabaikan bila Turnstile mati.
  "cf-turnstile-response": z.unknown().optional(),
  sejakDibuka: z
    .number()
    .int()
    .min(0)
    .transform((ms) => Math.min(ms, ATAP_SEJAK_DIBUKA_MS))
    .optional(),
});

function honeypotTerisi(nilai: unknown): boolean {
  if (nilai === undefined || nilai === null) return false;
  if (typeof nilai === "string") return nilai.trim() !== "";
  return true; // tipe apa pun selain string kosong: bukan pengunjung normal
}

// ————————————————————————————————————————————————————————————————
// Menutup oracle waktu & status pada jebakan (G-19a; model G-44, 2026-09-26)
// ————————————————————————————————————————————————————————————————
// Cabang jebakan membalas dengan body dan header yang identik dengan kiriman sah, tapi
// TIDAK PERNAH meneruskan apa pun — nol email, nol webhook (keputusan owner 2026-09-26,
// menutup M-2 audit ulang G-19). Supaya ia tidak bisa dikenali dari WAKTU (terukur dulu:
// jebakan med 3,7 ms vs sah med 215,9 ms) maupun STATUS, ia menunggu dan membalas menurut
// MODEL penerusan nyata yang dibangun HANYA dari kiriman sah di proses ini:
//
// 1. SUKSES, cincin cukup (≥ CONTOH_MINIMAL): satu contoh durasi kiriman sah yang berhasil,
//    condong ke yang terbaru, dengan beban sepadan (lihat `pilihContoh`) → tidur sampai tenggat
//    absolut → 200. Sebaran jebakan = sebaran kiriman sah karena contohnya memang dari sana.
// 2. SUKSES, cincin belum cukup (proses baru): contoh dari `contohAwal` — SEMUA kiriman sah
//    sukses yang sudah ada, termasuk yang pertama. Baru bila BELUM ADA SATU PUN kiriman sah di
//    proses ini dipakai PRIOR konservatif (`dariPrior`) — satu-satunya angka karangan, dan pada
//    keadaan itu penyerang juga belum punya satu pun kiriman sah di proses ini sebagai pembanding.
// 3. GAGAL (M-1): kalau kiriman sah TERAKHIR berakhir gagal, jebakan dibalas 502 dengan waktu
//    dari cincin gagal — cukup SATU contoh (kegagalan selalu dicatat, termasuk yang pertama).
//    Dulu cincin sukses yang sudah panas tetap dipilih sehingga jebakan dibalas 200 sementara
//    kiriman sah 502; status itu sendiri membocorkan field jebakan.
// 4. ANGGARAN HABIS / tanpa kanal: dibalas 503 di titik SEBELUM cabang ini (kode yang sama
//    untuk kiriman sah dan jebakan), jadi tidak ada yang perlu ditiru.
//
// MEKANISME KALIBRASI LAMA DICABUT (G-44). Dulu, selama cincin belum punya CONTOH_MINIMAL
// pengukuran, jebakan diperlakukan PERSIS seperti kiriman sah dan ikut diteruskan
// (≤ MAKS_KALIBRASI_JEBAKAN=10 per proses, plus penyegaran tiap JEDA_KALIBRASI_MS). Waktunya
// identik karena kodenya sama — tapi setiap kalibrasi adalah surel spam nyata ke info@ yang
// membakar kuota mailbox 30/jam (M-2), dan ADR 2026-08-26 sudah mencatat bahwa atapnya
// pernah tidak tertegakkan. Penggantinya prior (butir 2) + atap anggaran (G-42): setiap probe
// — sah atau jebakan — kini memakan satu dari 20 kiriman/jam situs dan satu dari 3/hari per
// IP, jadi penyerang tidak bisa lagi mengumpulkan ratusan pasang sampel untuk memisahkan
// sebaran; jendela "proses dingin" yang tersisa berakhir begitu ada CONTOH_MINIMAL+1 lead sah.
//
// BATAS YANG DITERIMA (dicatat, bukan terlupa):
// L-1 Cincin hanya segar oleh kiriman SAH. Penyerang yang hanya mengirim jebakan melihat cincin
//     yang membeku pada latensi terakhir yang diukur; kalau latensi mailbox bergeser tanpa lead
//     sah di antaranya, jebakan meniru angka lama. Harganya dibatasi anggaran (butir di atas).
// L-2 Tenggat email 10 s (BATAS_WAKTU_EMAIL_MS): server SMTP yang menerima DATA tepat sesudah
//     route menyerah membuat surel sampai padahal pengunjung dibalas 502 — ia mengirim ulang dan
//     owner menerima lead GANDA. Dipilih sadar: ganda lebih murah daripada hilang.
// L-3 Cincin, prior, dan anggaran per proses (satu replika, lihat G-16).
// L-4 Jedanya menahan slot server selama ±satu RTT kanal — biaya jebakan = biaya kiriman sah.
//
// Riwayat pengukuran rinci (peracunan cincin, penanda beban, satu hop penjadwal, koreksi
// timer) dipertahankan di komentar tiap bagian di bawah; angka-angka G-19/G-24 itu diukur
// pada versi yang masih meneruskan jebakan kalibrasi, dan hasil ukur model ini ada di
// docs/checklist.md baris G-44.
const CONTOH_DURASI_MAKS = 8;

/**
 * Berapa pengukuran sukses nyata yang harus ada sebelum cincin menggantikan prior.
 *
 * KENAPA BUKAN 1 (diukur dulu). Dengan satu contoh, jeda jebakan terpaku pada satu angka —
 * terukur pada webhook 900 ms: cincin berisi satu contoh dingin membuat jebakan konsisten
 * ±31 ms lebih lambat daripada kiriman sah yang sudah hangat (AUC 0,114). 4 cukup untuk
 * membuat contoh pertama kalah suara, sisanya diperbaiki pembobotan condong-baru.
 * Sejak G-44 angka ini tidak lagi dibayar dengan spam (tidak ada jebakan yang diteruskan);
 * yang dibayar adalah lamanya prior dipakai.
 */
const CONTOH_MINIMAL = 4;

/**
 * Satu pengukuran: SISA waktu sebuah kiriman sah, plus seberapa sibuk instans ini
 * ketika waktu itu diukur.
 *
 * `ms` diukur dari titik tepat sebelum penerusan (email/webhook) sampai titik tepat sebelum
 * balasan disusun. Bagian sebelum titik itu (routing Next, baca body, zod, Turnstile,
 * anggaran) TIDAK ditiru — ia benar-benar dijalani ulang oleh cabang jebakan dengan biaya
 * yang berlaku SEKARANG (terukur dulu: merekam total handler membuat jebakan +8,9 ms lebih
 * lambat pada instans yang cincinnya membeku di masa pemanasan, AUC 0,317).
 *
 * `beban` = PUNCAK jumlah penerusan yang berjalan berbarengan selama periode sibuk tempat
 * pengukuran ini lahir (1 = instans sepi). Penanda ini menutup peracunan cincin: terukur
 * dengan sink yang menyerialkan 200 ms, 40 kiriman sah serentak → median 2553 ms, sementara
 * saat sepi 205–219 ms. Pengukuran dari masa sibuk tidak diputar ulang saat instans sepi.
 */
type Contoh = { ms: number; beban: number };

/** Pengukuran kiriman sah yang BERAKHIR SUKSES. Terbaru di indeks terakhir. */
const contohSukses: Contoh[] = [];

/**
 * Pengukuran kiriman sah yang BERAKHIR GAGAL (email ditolak/putus/lewat tenggat, webhook
 * non-2xx). Cincin TERPISAH: mencampurnya ke cincin sukses adalah lubang yang sudah terukur
 * (banjir-sampai-timeout mengisi cincin dengan 4999 ms, lalu jebakan dipisahkan lewat uji satu
 * sisi ">250 ms"). Dibaca hanya ketika kiriman sah terakhir gagal (M-1).
 */
const contohGagal: Contoh[] = [];

/**
 * Kiriman sah SUKSES pertama sebuah proses tidak masuk cincin: ia membayar jabat tangan
 * TCP/TLS, pemanasan JIT, pemuatan modul — terukur #1 = 1052,7 ms vs #2..#6 = 929–967 ms
 * pada webhook 900 ms. Membiarkannya masuk memberi jebakan ekor atas yang tidak dimiliki
 * kiriman sah (AUC 0,336). Kegagalan TIDAK dibuang: M-1 menuntut jebakan meniru status gagal
 * sejak kegagalan pertama, dan satu contoh nyata lebih baik daripada prior.
 */
let pengukuranPertamaDibuang = false;

/**
 * Pengukuran sukses PALING AWAL proses ini (termasuk yang pertama, yang tidak masuk cincin),
 * paling banyak CONTOH_MINIMAL + 1. Dipakai hanya selama cincin belum cukup: contoh nyata
 * yang agak dingin tetap jauh lebih dekat ke kiriman sah daripada prior mana pun. Terukur di
 * rig mailpit lokal (G-44): 4 pasang pertama proses dingin AUC 1,000 dengan prior saja.
 */
const contohAwal: Contoh[] = [];

/** Atap contoh: batas waktu kanal terlama (email/webhook) plus kelonggaran sisa penanganan. */
const ATAP_CONTOH_MS = Math.max(BATAS_WAKTU_WEBHOOK_MS, BATAS_WAKTU_EMAIL_MS) + 1_000;

/**
 * Pelacak beban instans: berapa penerusan yang sedang berjalan, dan berapa puncaknya selama
 * periode sibuk yang sedang berlangsung. Puncaknya dinolkan lagi begitu tidak ada penerusan
 * tersisa — jadi "sibuk" tidak pernah menempel selamanya.
 */
let panggilanBerjalan = 0;
let puncakPanggilan = 0;

function mulaiPanggilanWebhook(): void {
  panggilanBerjalan += 1;
  if (panggilanBerjalan > puncakPanggilan) puncakPanggilan = panggilanBerjalan;
}

function selesaiPanggilanWebhook(): void {
  panggilanBerjalan = Math.max(0, panggilanBerjalan - 1);
  if (panggilanBerjalan === 0) puncakPanggilan = 0;
}

/**
 * Beban yang akan dihadapi kiriman sah SEANDAINYA ia tiba sekarang: dirinya sendiri
 * ditambah yang sedang berjalan, tapi tidak pernah lebih rendah daripada puncak periode
 * sibuk yang sedang berlangsung (di tengah banjir antrean sink belum surut walau jumlah yang
 * berjalan sudah menyusut).
 */
function bebanSekarang(): number {
  return Math.max(puncakPanggilan, panggilanBerjalan + 1);
}

/** Apakah kiriman sah terakhir yang selesai berakhir sukses (awal proses: dianggap sukses). */
let hasilTerakhirSukses = true;

function catatDurasi(ms: number, sukses: boolean): void {
  if (!Number.isFinite(ms)) return;
  hasilTerakhirSukses = sukses;
  if (sukses && contohAwal.length <= CONTOH_MINIMAL) {
    contohAwal.push({ ms: Math.min(Math.max(ms, 0), ATAP_CONTOH_MS), beban: Math.max(1, puncakPanggilan) });
  }
  if (sukses && !pengukuranPertamaDibuang) {
    pengukuranPertamaDibuang = true;
    return;
  }
  const cincin = sukses ? contohSukses : contohGagal;
  cincin.push({
    ms: Math.min(Math.max(ms, 0), ATAP_CONTOH_MS),
    beban: Math.max(1, puncakPanggilan),
  });
  if (cincin.length > CONTOH_DURASI_MAKS) cincin.shift();
}
/**
 * Pecahan acak [0,1) dari CSPRNG, bukan `Math.random()`.
 *
 * Bukan paranoia berlebihan: seluruh gunanya angka ini adalah menyamarkan waktu,
 * dan `Math.random()` adalah PRNG yang keadaannya bisa disimpulkan dari cukup
 * banyak keluaran. Di sini keluarannya justru terbaca penyerang dalam bentuk
 * durasi respons. `crypto` global tersedia di runtime Node maupun Edge.
 */
function acak(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] ?? 0) / 2 ** 32;
}

/**
 * Koreksi kekasaran timer, dalam ms — dikalibrasi sendiri, bukan angka khas satu
 * sistem operasi yang dibakar di kode.
 *
 * `setTimeout` selalu bangun agak terlambat, dan besarnya berbeda per platform.
 * Yang dikoreksi di sini adalah GALAT TERHADAP TENGGAT ABSOLUT (bukan terhadap
 * lama tidur yang diminta), karena tenggat absolut itulah yang harus ditepati:
 * jebakan harus selesai pada detik yang sama dengan kiriman sah, apa pun yang
 * terjadi sebelum jedanya dimulai. Koreksinya integral (galat × 0,3), jadi
 * rata-rata galatnya ditarik ke nol, bukan sekadar diperkecil.
 *
 * CATATAN PENGUKURAN, supaya tidak ada yang "memperbaiki" ini lagi tanpa data:
 * mengejar sisa waktu dengan `setTimeout(…, 0)` beruntun TERBUKTI jauh lebih
 * buruk, bukan lebih halus — di mesin uji `setTimeout(0)` bermedian 15,60 ms
 * (min 0,03 / maks 16,58), jadi setiap putaran "halus" justru membayar satu tik
 * penuh. Terukur AUC 0,124 pada webhook 30 ms. `setTimeout` bernilai bukan-nol di
 * mesin yang sama meleset median hanya 1,2 ms.
 */
let koreksiTidurMs = 0;

/**
 * Batas koreksi. Sengaja SEMPIT dan lebih kecil daripada satu tik penjadwal.
 *
 * Koreksi ini hanya boleh membetulkan keterlambatan KHAS `setTimeout` (di mesin
 * uji median 1,2–1,9 ms), tidak pernah satu tik penuh. Tanpa batas sempit,
 * beberapa pencilan 15–16 ms beruntun menyeret koreksi sampai belasan milidetik,
 * dan sesudah itu jeda jebakan bangun SATU TIK TERLALU CEPAT — terukur jebakan
 * p25 32,3 ms padahal kiriman sah tidak pernah di bawah 32,8 ms (AUC 0,707).
 *
 * KOREKSI KLAIM (G-24). Baris di sini dulu berbunyi "galat terburuk tetap terlambat
 * sedikit, bukan lebih cepat sekaligus". Itu TIDAK BENAR, dan auditor mengukurnya.
 * Sisi "lebih cepat" ada, dan yang membatasinya bukan tanda galat melainkan klem
 * ±5 ms di atas. Terukur pada webhook 900 ms tanpa gangguan apa pun: 5 dari 40
 * jebakan selesai lebih cepat daripada kiriman sah TERCEPAT (jebakan min 900,2 ms
 * vs sah min 902,5 ms). Yang bisa DIDORONG penyerang juga nyata: 120 jebakan
 * serentak menggeser `koreksiTidurMs` lewat galat tidur yang sebenarnya mengukur
 * antrean event loop — pada webhook 30 ms, median jebakan 46,6 → 45,7 ms dan
 * "lebih cepat daripada sah tercepat" 1/40 → 5/40.
 *
 * Yang dikerjakan untuk itu: integral hanya berjalan ketika jeda ini SENDIRIAN
 * (`jedaBerjalan`), karena galat di bawah beban tidak mengukur kekasaran tik. Terukur
 * sesudahnya pada rig yang sama, versi ini, webhook 30 ms: median jebakan 62,2 → 61,7 ms
 * dan "lebih cepat daripada sah tercepat" 3/40 → 0/40; webhook 900 ms 0/40 → 1/40.
 * Geseran oleh banjir itulah yang hilang.
 *
 * Sisi "lebih cepat" SENDIRI tidak hilang dan tidak diklaim hilang: pada versi ini
 * masih terukur 3/40 (webhook 30 ms, sebelum banjir apa pun). Yang menahannya cuma
 * klem ±5 ms di atas. Jangan melebarkan klem ini tanpa mengukur ulang.
 */
const KOREKSI_MIN_MS = -5;
const KOREKSI_MAKS_MS = 5;
/** Pemotongan galat per sampel dan penguatan integralnya (lihat `tidurSampai`). */
const BATAS_GALAT_MS = 3;
const PENGUATAN_KOREKSI = 0.3;

/**
 * Berapa jeda jebakan yang sedang berjalan berbarengan.
 *
 * Dipakai untuk satu hal: koreksi HANYA diintegralkan ketika jeda ini sendirian.
 * Alasannya terukur — `koreksiTidurMs` global, dan galat tidur di bawah beban
 * didominasi antrean event loop, bukan kekasaran tik. Penyerang memakai itu:
 * 120 jebakan serentak menyeret koreksi ke atas, lalu jeda-jeda sesudahnya bangun
 * terlalu cepat. Angkanya ada di blok `KOREKSI_MIN_MS`.
 */
let jedaBerjalan = 0;

/** Tidur sampai `selesaiPada` (jam `performance.now()`), bukan selama sekian ms. */
async function tidurSampai(selesaiPada: number): Promise<void> {
  const lama = selesaiPada - performance.now() - koreksiTidurMs;
  if (lama <= 0) return; // sudah lewat: jangan mencemari kalibrasi dengan galat semu
  jedaBerjalan += 1;
  try {
    await new Promise<void>((selesai) => setTimeout(selesai, lama));
  } finally {
    jedaBerjalan -= 1;
  }
  // Di bawah beban, galat tidur mengukur antrean event loop — bukan yang mau
  // dikoreksi di sini, dan itu justru kanal yang bisa didorong penyerang.
  if (jedaBerjalan > 0) return;

  // Galat dipotong sebelum diintegralkan. Di mesin uji `setTimeout` meleset median
  // 1,2 ms tapi sesekali satu tik penuh (maks 15,8 ms); tanpa pemotongan, satu
  // pencilan menyentak koreksi sampai belasan milidetik dan beberapa jeda
  // berikutnya jadi SATU TIK TERLALU CEPAT — terukur jebakan min 30,8 ms padahal
  // kiriman sah tidak pernah di bawah 32,5 ms. Dipotong + penguatan kecil = koreksi
  // mengejar galat yang KHAS, bukan galat terburuk.
  const galat = performance.now() - selesaiPada; // > 0 = kelewat lama
  const galatDipotong = Math.min(BATAS_GALAT_MS, Math.max(-BATAS_GALAT_MS, galat));
  koreksiTidurMs = Math.min(
    KOREKSI_MAKS_MS,
    Math.max(KOREKSI_MIN_MS, koreksiTidurMs + galatDipotong * PENGUATAN_KOREKSI),
  );
}

/**
 * Seberapa condong pengambilan contoh ke pengukuran terbaru, dalam satuan "slot".
 * Jarak mundur dari slot terbaru diambil dari sebaran eksponensial: ±49% peluang
 * memakai pengukuran paling baru, dan bobotnya turun cepat ke belakang.
 *
 * Kenapa condong, bukan seragam: di keadaan tenang seluruh slot berasal dari
 * distribusi yang sama sehingga condong maupun seragam menghasilkan sebaran
 * marginal yang sama persis — tidak ada yang hilang. Bedanya baru terasa saat
 * latensi webhook BERUBAH (mis. setelah dibanjiri): condong-baru membuat cincin
 * mengejar keadaan sekarang dalam hitungan satu-dua kiriman, bukan delapan.
 */
const KECONDONGAN_BARU = 1.5;

/**
 * TIDAK ADA JITTER BUATAN — dan itu keputusan yang diukur, bukan kelalaian.
 *
 * Versi sebelumnya menggoyang jeda jebakan ±3% "supaya satu nilai tidak diputar
 * ulang persis". Terukur, goyangan itu justru membuka oracle baru: pada webhook
 * 900 ms kiriman sah tersebar sempit (904–919 ms; semua melewati jaringan dan
 * proses yang sama) sementara jebakan tersebar ±27 ms di sekelilingnya. Yang
 * membocorkan jebakan bukan lagi nilai tengahnya melainkan LEBAR SEBARANNYA —
 * AUC 0,181, akurasi ambang terbaik 85%. "Terlalu bervariasi" sama membocorkan
 * dengan "terlalu cepat".
 *
 * Mengecilkan jitter tidak menyelesaikannya (jebakan malah jadi yang paling
 * presisi, dan itu pun terbaca). Menyamakannya — kiriman sah ikut membayar jitter
 * yang sama — juga sudah dicoba dan DITOLAK setelah diukur: jeda sependek itu
 * menuntut satu `setTimeout` tambahan, dan satu tik timer Windows (±15,6 ms)
 * menelan seluruh maksudnya. Pada webhook 30 ms hasilnya kiriman sah med 62,0 ms
 * vs jebakan 47,0 ms, AUC 0,868 — lebih bocor daripada sebelum disamakan.
 *
 * Yang benar ternyata paling sederhana: pakai contoh mentah dari cincin, apa
 * adanya. Isi cincin sudah punya sebaran yang tepat karena ia memang kumpulan
 * durasi kiriman sah yang sungguh terjadi di proses ini (terukur bervariasi
 * 929–1053 ms pada webhook "tetap" 900 ms — jaringan dan event loop tidak pernah
 * benar-benar tetap). Menambahkan sebaran buatan di atas sebaran nyata hanya
 * membuat totalnya lebih lebar daripada aslinya.
 */

/**
 * Ambil satu contoh dari cincin, condong ke yang paling baru (KECONDONGAN_BARU).
 *
 * Yang diambil hanya contoh dengan `beban` tidak lebih berat daripada beban saat ini; bila
 * tidak ada, contoh dengan beban PALING RINGAN yang dipunya (tebakan terbaik yang masih angka
 * nyata — meneruskan jebakan untuk mengukur bukan lagi pilihan sejak G-44). Di keadaan tenang
 * semua contoh berbeban 1 dan `bebanSekarang()` juga 1, jadi saringan ini tidak mengubah apa
 * pun di keadaan mapan (terukur dulu dengan rig ABBA: AUC 0,431 → 0,416 pada webhook 30 ms).
 */
function pilihContoh(cincin: Contoh[]): number | null {
  if (cincin.length === 0) return null;
  const beban = bebanSekarang();
  let layak = cincin.filter((contoh) => contoh.beban <= beban);
  if (layak.length === 0) {
    const teringan = Math.min(...cincin.map((contoh) => contoh.beban));
    layak = cincin.filter((contoh) => contoh.beban === teringan);
  }
  const jumlah = layak.length;
  const mundur = Math.min(jumlah - 1, Math.floor(-Math.log(1 - acak()) * KECONDONGAN_BARU));
  const ms = layak[jumlah - 1 - mundur]?.ms;
  return Number.isFinite(ms) && (ms as number) >= 0 ? (ms as number) : null;
}

/**
 * PRIOR konservatif untuk proses yang belum punya SATU PUN kiriman sah sukses (G-44).
 *
 * Log-seragam pada [PRIOR_MIN_MS, PRIOR_MAKS_MS] = [250, 1600] ms. Dasarnya: audit ulang G-19
 * (2026-09-26) mengukur penerusan email nyata ±60–1600 ms (60 ms = mailpit di host yang sama;
 * mailbox sungguhan melewati jaringan + STARTTLS + AUTH + DATA, beberapa RTT). Batas bawah
 * dinaikkan ke 250 ms karena mailbox produksi tidak pernah berada di host yang sama; log-seragam
 * karena ketidakpastiannya berlipat (skala), bukan tambahan.
 *
 * HARGANYA, ditulis terang: prior adalah tebakan. Bila latensi nyata jatuh di luar rentang itu
 * (mis. SMTP lokal 60 ms), jebakan di proses yang BELUM pernah meneruskan kiriman sah bisa
 * dibedakan — tapi hanya dengan pembanding dari luar proses ini (sesudah kiriman sah pertama,
 * `contohAwal` menggantikan prior), dan setiap probe memakan anggaran (G-42). Terukur di rig
 * mailpit lokal: lihat baris G-44 di docs/checklist.md.
 * DITOLAK: meneruskan jebakan untuk kalibrasi (M-2, spam ke info@); menahan kiriman sah sampai
 * lantai yang sama (setiap lead asli di proses dingin membayar detik tambahan).
 */
const PRIOR_MIN_MS = 250;
const PRIOR_MAKS_MS = 1_600;

function dariPrior(): number {
  return PRIOR_MIN_MS * (PRIOR_MAKS_MS / PRIOR_MIN_MS) ** acak();
}

/** Rencana cabang jebakan: berapa lama menunggu, dan balasan (sukses/gagal) mana yang ditiru. */
type Rencana = { ms: number; sukses: boolean };

function rencanaJeda(): Rencana {
  if (!hasilTerakhirSukses) {
    // M-1: kiriman sah terakhir gagal → tiru GAGAL, walau baru satu contoh. `contohGagal`
    // tidak pernah kosong di sini (kegagalan selalu dicatat); prior hanya jaring pengaman.
    return { ms: pilihContoh(contohGagal) ?? dariPrior(), sukses: false };
  }
  const ms = pilihContoh(contohSukses.length >= CONTOH_MINIMAL ? contohSukses : contohAwal);
  return { ms: ms ?? dariPrior(), sukses: true };
}

/**
 * Cabang jebakan, sisi waktu & statusnya. Tidak pernah meneruskan apa pun (G-44).
 * Pemanggil membalas seperti kiriman sah yang berakhir sama (`sukses` → 200, selain itu → 502).
 */
async function jedaSeolahDiteruskan(): Promise<{ sukses: boolean }> {
  // Titik tempel: padanan persis dari titik tepat sebelum penerusan di cabang kiriman sah.
  const titik = performance.now();
  const rencana = rencanaJeda();
  await tidurSampai(titik + rencana.ms);
  return { sukses: rencana.sukses };
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
// Kanal penerusan (G-41): email SMTP primer + webhook opsional
// ————————————————————————————————————————————————————————————————
type Kanal = { email: Env | null; webhook: string | null };

/**
 * Kanal yang aktif untuk permintaan ini, atau `null` bila tidak ada satu pun (→ 503).
 *
 * Env sudah divalidasi saat boot (instrumentation.ts → exit 1), jadi `getEnv()` di sini tidak
 * gagal di container yang sedang melayani. Kalau tetap gagal (mis. dijalankan tanpa boot hook),
 * kanal email dianggap mati — TIDAK pernah dianggap hidup — dan hanya nama error yang dicatat.
 */
function kanalAktif(): Kanal | null {
  let email: Env | null = null;
  try {
    const env = getEnv();
    if (env.CONTACT_ENABLED) email = env;
  } catch (err) {
    console.error(`[lead] env tidak valid: ${err instanceof Error ? err.name : "unknown"}`);
  }
  const webhook = process.env.LEAD_WEBHOOK_URL || null;
  return email || webhook ? { email, webhook } : null;
}

type DataLead = z.infer<typeof LeadSchema>;

/** Nama/kode error yang aman dicatat: hanya token huruf besar/garis bawah (mis. EAUTH). */
function jenisError(err: unknown): string {
  if (!(err instanceof Error)) return "unknown";
  const kode = (err as { code?: unknown }).code;
  return typeof kode === "string" && /^[A-Z_]{2,32}$/.test(kode) ? `${err.name}/${kode}` : err.name;
}

async function kirimEmail(env: Env, data: DataLead): Promise<boolean> {
  try {
    // Isi TIDAK diberi `amanUntukSpreadsheet`: email bukan spreadsheet, dan yang dibaca owner
    // di inbox harus persis yang diketik pengunjung. Header aman: lihat lib/mailer.ts.
    await kirimEmailLead(
      env,
      PENERIMA_LEAD,
      { nama: data.nama, kontak: data.kontak, pesan: data.pesan, produk: data.produk ?? "lainnya" },
      BATAS_WAKTU_EMAIL_MS,
    );
    return true;
  } catch (err) {
    // Tanpa PII dan tanpa host/alamat: hanya jenis error.
    console.error(`[lead] email gagal terkirim: ${jenisError(err)}`);
    return false;
  }
}

async function kirimWebhook(webhook: string, data: DataLead): Promise<boolean> {
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(BATAS_WAKTU_WEBHOOK_MS),
      body: JSON.stringify({
        nama: amanUntukSpreadsheet(data.nama),
        kontak: amanUntukSpreadsheet(data.kontak),
        pesan: amanUntukSpreadsheet(data.pesan),
        produk: data.produk ?? "lainnya",
        diterima: new Date().toISOString(),
      }),
    });

    // Balasan webhook tidak dipakai — lepaskan koneksinya, jangan digantung.
    await res.body?.cancel().catch(() => undefined);

    if (res.ok) return true;
    // Hanya status; JANGAN pernah mencatat isi form atau URL webhook (URL bisa
    // memuat token rahasia).
    console.error(`[lead] webhook menolak kiriman, status ${res.status}`);
    return false;
  } catch {
    console.error("[lead] webhook tidak terjangkau atau melewati batas waktu");
    return false;
  }
}

/**
 * Teruskan ke semua kanal aktif SECARA PARALEL; hasilnya = apakah boleh membalas "terkirim".
 *
 * - Email aktif → hasil = hasil EMAIL. Webhook (bila ada) tetap dijalankan dan kegagalannya
 *   hanya dicatat: lead sudah sampai ke inbox owner, jadi membalas 502 akan membuat pengunjung
 *   mengirim ulang (lead ganda) padahal tidak ada yang hilang.
 * - Hanya webhook → hasil = hasil webhook (perilaku sebelum G-41, tidak berubah).
 * - Tidak pernah membalas sukses bila kanal primer gagal: "terkirim" palsu dilarang ADR 2026-08-25.
 * Paralel, bukan berurutan: waktu tunggu pengunjung = kanal terlama, bukan jumlah keduanya.
 */
async function teruskanLead(kanal: Kanal, data: DataLead): Promise<boolean> {
  const [email, webhook] = await Promise.all([
    kanal.email ? kirimEmail(kanal.email, data) : Promise.resolve(null),
    kanal.webhook ? kirimWebhook(kanal.webhook, data) : Promise.resolve(null),
  ]);
  if (email !== null) {
    if (webhook === false) console.error("[lead] webhook gagal; lead tetap terkirim lewat email (kanal primer)");
    return email;
  }
  return webhook === true;
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
const PESAN_TIDAK_TERSEDIA = "Form sedang tidak tersedia. Silakan hubungi kami lewat WhatsApp.";

/** Anggaran kirim situs + per IP (G-42), satu per proses. Angka: `ANGGARAN_KIRIM` di ./batas.ts. */
const anggaran = buatAnggaran(ANGGARAN_KIRIM);

/** Konfigurasi Turnstile untuk permintaan ini, atau `null` bila mati (kedua env kosong). */
function konfigurasiTurnstile(): { berkasRahasia: string; hostSitus: string } | null {
  try {
    const env = getEnv();
    if (!turnstileAktif(env)) return null;
    return { berkasRahasia: env.TURNSTILE_SECRET_FILE, hostSitus: new URL(env.SITE_URL).hostname };
  } catch {
    return null; // env tak valid sudah menghentikan boot (instrumentation.ts)
  }
}

export async function POST(req: NextRequest) {
  // Dua pagar bentuk permintaan didahulukan: keduanya hanya membaca header, tidak
  // menyentuh Map rate limit maupun body, dan menolak di sini berarti kiriman
  // lintas situs tidak ikut menghabiskan jatah IP pengunjung yang dipinjam.
  if (asalAsing(req)) {
    return balas({ error: PESAN_GAGAL }, 403);
  }

  // Wajib `application/json`. Ini yang memaksa peramban melakukan preflight untuk
  // setiap POST lintas origin: tiga tipe "sederhana" (text/plain,
  // x-www-form-urlencoded, multipart/form-data) berhenti di sini, dan preflight
  // tidak pernah dijawab karena endpoint ini memang tidak punya handler OPTIONS
  // dan tidak mengirim satu pun header CORS.
  //
  // Efek samping yang disengaja: pengiriman <form> bawaan peramban (yang selalu
  // mengirim salah satu tipe sederhana) juga berhenti di sini — lihat `action`
  // pada components/sections/form-kontak.tsx, yang memakai jalur ini sebagai
  // penampung aman supaya isian tidak pernah mendarat di query string.
  const tipeIsi = (req.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase();
  if (tipeIsi !== TIPE_ISI_WAJIB) {
    return balas({ error: "Format tidak valid." }, 415);
  }

  const identitas = identitasKlien(req);
  const kuota = konsumsiKuota(identitas);
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

  // Terlalu cepat untuk diisi manusia (atau tidak melaporkan waktu sama sekali).
  // Balasannya disamakan dengan Origin asing — satu pintu "ditolak" saja, supaya
  // tidak ada status khusus yang memberi tahu bot bahwa yang salah hanya waktunya.
  // Pengunjung sungguhan yang entah bagaimana tertimpa ini melihat pesan `gagal`
  // ("coba kirim lagi") dan percobaan berikutnya pasti lolos, karena halamannya
  // sudah lebih lama terbuka.
  if ((parsed.data.sejakDibuka ?? 0) < AMBANG_ISI_MS) {
    return balas({ error: PESAN_GAGAL }, 403);
  }

  const kanal = kanalAktif();
  if (!kanal) {
    // Tanpa tujuan (email mati DAN webhook kosong), lead hilang senyap. Jangan pernah
    // membalas {ok:true} di sini — halaman kontak menjanjikan "Pesan Anda terkirim."
    //
    // Diperiksa SEBELUM cabang honeypot supaya bot tidak bisa membedakan jebakan
    // dari kiriman biasa hanya dengan melihat 503 vs 200.
    return balas({ error: PESAN_TIDAK_TERSEDIA }, 503);
  }

  // Turnstile (G-43), bila aktif. Diperiksa untuk kiriman sah DAN jebakan dengan kode yang sama,
  // SEBELUM anggaran: token gagal tidak pernah memakan jatah surel. Token gagal → 403 generik,
  // SAMA PERSIS dengan Origin asing dan "terlalu cepat" — satu pintu "ditolak" tanpa status
  // khusus yang memberi tahu bot bahwa yang salah hanya tokennya.
  // Siteverify tak terjangkau → DITOLAK (fail-closed, keputusan owner 2026-09-27, ADR G-46):
  // 503 + arahan WhatsApp, sama untuk kiriman sah dan jebakan. Menggantikan fail-open G-43.
  const turnstile = konfigurasiTurnstile();
  if (turnstile) {
    const hasil = await periksaTurnstile(parsed.data["cf-turnstile-response"], {
      ...turnstile,
      aksi: AKSI_PEMERIKSAAN,
    });
    if (hasil === "ditolak") return balas({ error: PESAN_GAGAL }, 403);
    if (hasil === "galat-konfigurasi" || hasil === "tak-terjangkau") {
      return balas({ error: PESAN_TIDAK_TERSEDIA }, 503);
    }
  }

  // Anggaran kirim (G-42, menutup H-1). Dikonsumsi di SATU titik untuk kiriman sah dan jebakan,
  // sebelum cabangnya berpisah — jadi KAPAN atap tersandung tidak membedakan keduanya, dan
  // balasannya (503, body sama dengan "tanpa kanal") keluar dari baris yang sama.
  const kunciIp = identitas.kunci.startsWith("ip:") ? identitas.kunci : null;
  if (!anggaran.coba(kunciIp)) {
    console.error("[lead] anggaran kirim habis (situs/jam atau IP/hari)");
    return balas({ error: PESAN_TIDAK_TERSEDIA }, 503);
  }

  if (honeypotTerisi(parsed.data.website)) {
    // Terperangkap: TIDAK PERNAH diteruskan (nol email, nol webhook — G-44). Waktu dan status
    // ditiru dari model penerusan nyata (blok "Menutup oracle waktu & status" di atas).
    // Body, status, dan header harus tetap identik dengan cabang kiriman sah di bawah.
    const jeda = await jedaSeolahDiteruskan();
    return jeda.sukses ? balas({ ok: true }, 200) : balas({ error: PESAN_GAGAL }, 502);
  }

  mulaiPanggilanWebhook();
  const mulaiWebhook = performance.now();
  try {
    const sukses = await teruskanLead(kanal, parsed.data);
    const balasan = sukses ? balas({ ok: true }, 200) : balas({ error: PESAN_GAGAL }, 502);

    // SATU HOP PENJADWAL, sengaja, supaya kedua cabang melewati jumlah hop yang sama
    // (G-24, temuan MEDIUM auditor).
    //
    // Cabang jebakan selalu bangun dari `setTimeout`; cabang kiriman sah dulu tidak
    // punya timer sama sekali, jadi hanya jebakan yang membayar kuantisasi tik
    // penjadwal. Ekornya searah dan terukur: pada webhook 30 ms, n=300 per kelompok,
    // 49/300 (16,3%) jebakan jatuh DI LUAR amplop kiriman sah — 46 di antaranya di
    // atas, pada median+12,3…16,6 ms (satu tik Windows) — dengan rasio sd 3,38×.
    // Ekor sepihak seperti itu bisa dipakai apa adanya: beberapa probe sudah cukup.
    //
    // Hop ini ada DI DALAM jendela ukur, jadi ongkosnya ikut terekam ke cincin dan
    // ikut diputar ulang cabang jebakan — itu syaratnya. (Percobaan lama menaruh
    // penyamaran serupa DI LUAR jendela ukur dan hasilnya lebih buruk: kiriman sah
    // med 62,0 ms vs jebakan 47,0 ms, AUC 0,868. Lihat blok "TIDAK ADA JITTER BUATAN".)
    //
    // Terukur sesudah perubahan ini, rig dan n yang sama, tiga ronde: 8/300 (2,7%),
    // 7/300 (2,3%), dan 9/300 (3,0%) di luar amplop, rasio sd 1,06× / 1,11× / 1,01×.
    // Ekor SEARAH-nya yang hilang: pada ronde terakhir hanya 2 dari 300 di atas amplop
    // dan cuma median+2,4 ms, bukan lagi median+14 ms. AUC 0,540 / 0,571 / 0,523;
    // dua ronde baseline pada rig yang sama 0,431 dan 0,424 — sama-sama meleset dari
    // 0,5 dan tidak lebih jauh.
    //
    // HARGANYA, supaya bisa dicabut sadar: setiap kiriman sah jadi satu tik lebih
    // lambat. Terukur di mesin uji (Windows) median 46,6 → 61,8 ms, +15,2 ms. Besarnya
    // = satu tik penjadwal OS, jadi di Linux/Vercel jauh lebih pendek — TIDAK diukur
    // di sini, jangan mengarang angkanya. 15 ms pada permintaan yang memang sudah
    // memakan ratusan milidetik tidak terlihat manusia; kalau suatu saat terlihat,
    // yang dibuang adalah baris ini, dan ekor satu tik itu kembali.
    await new Promise<void>((selesai) => setTimeout(selesai, 0));

    // Diukur sampai titik terakhir sebelum balasan dikembalikan — itulah sisa waktu
    // yang dihabiskan kiriman sah setelah titik tempel, dan itu yang ditiru cabang
    // jebakan. Sukses dan gagal masuk cincin yang BERBEDA (lihat `contohGagal`).
    catatDurasi(performance.now() - mulaiWebhook, sukses);
    return balasan;
  } finally {
    // Urutan wajib: `catatDurasi` sudah jalan dan `puncakPanggilan` belum dinolkan (jadi
    // pengukuran barusan tertandai beban yang benar).
    selesaiPanggilanWebhook();
  }
}
