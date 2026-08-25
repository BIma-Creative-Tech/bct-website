import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BATAS_ISIAN } from "./batas";

/**
 * Endpoint form lead — dikeraskan setelah audit keamanan (G-05).
 *
 * Prinsip yang dijaga:
 * - Validasi zod ketat, hanya field yang dibutuhkan (UU PDP: data minimal).
 * - Tidak menyimpan apa pun; hanya meneruskan ke LEAD_WEBHOOK_URL.
 * - Tidak pernah menulis isi form (nama/kontak/pesan) atau URL webhook ke log.
 * - Respons error generik: tanpa stack, tanpa detail internal, tanpa header CORS.
 * - Situs tidak boleh bilang "terkirim" kalau tidak ada yang menerima.
 * - Jebakan bot tidak boleh bisa dikenali dari LUAR — bukan hanya status/body/header,
 *   tapi juga waktu respons (G-19).
 *
 * TIGA HAL YANG SENGAJA BELUM DIKERJAKAN (menunggu keputusan owner):
 * 1. Penyimpanan rate limit bersama (KV/Redis) — butuh layanan + dependensi baru (G-16).
 * 2. Pengerasan tujuan webhook (wajib https + header rahasia) — menyentuh data pribadi.
 * 3. Captcha (Turnstile/hCaptcha) — G-20 bagian (b), dependensi + layanan pihak ketiga,
 *    jadi gerbang konfirmasi owner. Yang dikerjakan di berkas ini hanya bagian (a):
 *    Origin, content-type, dan ambang waktu isi form.
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
 * membuktikan = captcha (G-20b, gerbang owner).
 */
const AMBANG_ISI_MS = 3_000;

/** Satu-satunya content-type yang diterima. */
const TIPE_ISI_WAJIB = "application/json";

/**
 * Kumpulan host yang dianggap "situs ini".
 *
 * `host` (dan `x-forwarded-host` di belakang proxy) memang bisa ditulis klien —
 * tapi tidak oleh peramban yang sedang menyerang atas nama pengunjung: pada
 * permintaan lintas origin peramban mengisi sendiri `Host` (tujuan sebenarnya) dan
 * `Origin` (asal sebenarnya), dan keduanya termasuk header terlarang untuk skrip.
 * Klien non-peramban (curl) memang bisa mengarang keduanya sekaligus — dan
 * memang bukan itu yang ditutup pagar ini (lihat `asalAsing`).
 */
function hostSitusIni(req: NextRequest): Set<string> {
  const daftar = [
    req.headers.get("host"),
    hopTerdekat(req.headers.get("x-forwarded-host")),
    req.nextUrl.host,
  ];
  const hasil = new Set<string>();
  for (const nilai of daftar) {
    const host = nilai?.trim().toLowerCase();
    if (host) hasil.add(host);
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

  let host: string;
  try {
    host = new URL(asal).host.toLowerCase();
  } catch {
    return true; // bukan URL sah: hanya klien yang mengarang header yang begini
  }
  if (!host) return true;
  return !hostSitusIni(req).has(host);
}

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
  // Dibatasi 30 hari supaya angka konyol tidak ikut lolos ke logika di bawah.
  sejakDibuka: z
    .number()
    .int()
    .min(0)
    .max(30 * 24 * 60 * 60 * 1_000)
    .optional(),
});

function honeypotTerisi(nilai: unknown): boolean {
  if (nilai === undefined || nilai === null) return false;
  if (typeof nilai === "string") return nilai.trim() !== "";
  return true; // tipe apa pun selain string kosong: bukan pengunjung normal
}

// ————————————————————————————————————————————————————————————————
// Menutup oracle waktu pada jebakan (G-19a)
// ————————————————————————————————————————————————————————————————
// Cabang jebakan membalas 200 dengan body dan header yang identik dengan kiriman
// sukses — tapi ia `return` tanpa pernah memanggil webhook, sehingga SELALU jauh
// lebih cepat. Terukur security-auditor dengan webhook berlatensi 200 ms:
// terperangkap median 3,7 ms vs sah median 215,9 ms. Dua kelompok yang terpisah
// sempurna: satu pasang request cukup untuk menemukan nama field jebakan, dan
// sesudah itu jebakannya hangus selamanya.
//
// Perbaikannya: cabang jebakan menunggu selama perkiraan waktu yang DIHABISKAN
// KIRIMAN SAH di webhook. Perkiraannya tidak ditebak konstan, melainkan diambil
// dari pengukuran nyata — durasi setiap panggilan webhook (sukses, non-2xx,
// maupun timeout) disimpan di cincin kecil di bawah, lalu satu contoh diambil
// acak dan digoyang ±10%. Karena contohnya berasal dari distribusi yang sama,
// sebaran kedua kelompok saling tumpang tindih, bukan sekadar bergeser.
//
// BATAS YANG PERLU DIKETAHUI:
// 1. Sebelum ada satu pun kiriman sah di instans ini, cincinnya masih berisi
//    tebakan awal. Kalau webhook sebenarnya jauh lebih lambat dari tebakan itu,
//    permintaan jebakan PERTAMA di instans yang baru dingin masih bisa terbaca
//    lebih cepat. Satu kiriman sah sudah cukup untuk mengoreksinya.
// 2. Cincin ini per instans, sama seperti rate limit (lihat G-16).
// 3. Jedanya memang menahan slot server selama ±satu RTT webhook. Itu memang
//    harganya: biaya permintaan jebakan dibuat sama dengan biaya kiriman sah.
// 4. Sumbu waktu bukan satu-satunya yang tersisa saat webhook SEDANG RUSAK:
//    kiriman sah dibalas 502 sementara jebakan tetap 200, jadi selama gangguan
//    jebakannya bisa dikenali dari status. Itu tidak diperbaiki di sini dengan
//    sengaja — menyembunyikannya berarti membalas "terkirim" untuk lead yang
//    tidak sampai, dan itu dilarang (ADR 2026-08-25).
const CONTOH_DURASI_MAKS = 16;
/** Tebakan awal RTT webhook, hanya dipakai sampai ada pengukuran nyata. */
const DURASI_WEBHOOK_AWAL_MS = 220;
const contohDurasiWebhook = new Array<number>(CONTOH_DURASI_MAKS).fill(DURASI_WEBHOOK_AWAL_MS);
let posisiContoh = 0;

function catatDurasiWebhook(ms: number): void {
  if (!Number.isFinite(ms)) return;
  contohDurasiWebhook[posisiContoh] = Math.min(Math.max(ms, 0), BATAS_WAKTU_WEBHOOK_MS);
  posisiContoh = (posisiContoh + 1) % CONTOH_DURASI_MAKS;
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
 * Selisih rata-rata antara lama `setTimeout` yang DIMINTA dan yang benar-benar
 * terjadi, dalam ms. Nol pada mesin dengan timer halus; di Windows granularitas
 * timernya kasar (±15 ms) dan tanpa koreksi ini cabang jebakan jadi konsisten
 * LEBIH LAMBAT daripada kiriman sah — sama bocornya dengan konsisten lebih cepat,
 * hanya berpindah tanda. Nilainya dikalibrasi sendiri dari jeda-jeda sebelumnya,
 * jadi tidak ada angka khas satu sistem operasi yang dibakar di kode.
 */
let koreksiTidurMs = 0;

function tidur(ms: number): Promise<void> {
  const target = Math.max(0, ms - koreksiTidurMs);
  const mulai = performance.now();
  return new Promise<void>((selesai) => setTimeout(selesai, target)).then(() => {
    const lebih = performance.now() - mulai - target;
    // Rata-rata bergerak; dijaga di rentang wajar supaya satu event loop yang
    // tersendat tidak mengacaukan seluruh kalibrasi.
    koreksiTidurMs = Math.min(80, Math.max(0, koreksiTidurMs * 0.7 + lebih * 0.3));
  });
}

function jedaSeolahDiteruskan(): Promise<void> {
  const dasar =
    contohDurasiWebhook[Math.floor(acak() * CONTOH_DURASI_MAKS)] ?? DURASI_WEBHOOK_AWAL_MS;
  // Jitter kecil (±3%) DI ATAS contoh nyata. Sebarannya sudah datang dari
  // pengukuran sungguhan; jitter hanya mencegah satu nilai diputar ulang persis.
  // Sengaja tidak lebih lebar: jeda yang sebarannya jauh lebih gemuk daripada
  // kiriman sah juga bisa dibedakan, hanya butuh lebih banyak sampel.
  const jitter = 0.97 + acak() * 0.06;
  const ms = Math.min(BATAS_WAKTU_WEBHOOK_MS, Math.max(0, dasar * jitter));
  return tidur(ms);
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

  // Terlalu cepat untuk diisi manusia (atau tidak melaporkan waktu sama sekali).
  // Balasannya disamakan dengan Origin asing — satu pintu "ditolak" saja, supaya
  // tidak ada status khusus yang memberi tahu bot bahwa yang salah hanya waktunya.
  // Pengunjung sungguhan yang entah bagaimana tertimpa ini melihat pesan `gagal`
  // ("coba kirim lagi") dan percobaan berikutnya pasti lolos, karena halamannya
  // sudah lebih lama terbuka.
  if ((parsed.data.sejakDibuka ?? 0) < AMBANG_ISI_MS) {
    return balas({ error: PESAN_GAGAL }, 403);
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
    // apa pun ke webhook. Jedanya menyamakan sumbu terakhir yang masih membocorkan
    // jebakan ini — waktu (G-19a, lihat blok penjelasan di atas).
    await jedaSeolahDiteruskan();
    return balas({ ok: true }, 200);
  }

  const mulaiWebhook = performance.now();
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
    // Dicatat SETELAH koneksi dilepas supaya yang terukur adalah seluruh waktu
    // yang dihabiskan kiriman sah di cabang ini — itu yang harus ditiru jeda
    // jebakan. Dicatat untuk 2xx maupun non-2xx: keduanya sama-sama menunggu.
    catatDurasiWebhook(performance.now() - mulaiWebhook);

    if (!res.ok) {
      // Hanya status; JANGAN pernah mencatat isi form atau URL webhook (URL bisa
      // memuat token rahasia).
      console.error(`[lead] webhook menolak kiriman, status ${res.status}`);
      return balas({ error: PESAN_GAGAL }, 502);
    }
  } catch {
    catatDurasiWebhook(performance.now() - mulaiWebhook);
    console.error("[lead] webhook tidak terjangkau atau melewati batas waktu");
    return balas({ error: PESAN_GAGAL }, 502);
  }

  return balas({ ok: true }, 200);
}
