/**
 * Batas panjang isian form lead — SATU angka untuk dua sisi.
 *
 * Dipakai oleh:
 * 1. Skema zod di `./route.ts` (`satuBaris`/`banyakBaris`).
 * 2. Form `/kontak` (`components/sections/form-kontak.tsx`) untuk `minLength` dan
 *    pemeriksaan panjang di browser, serta `<HalamanKontak>` untuk mengisi token
 *    `{maks}` pada `validasiLokal.pesan.terlaluPanjang` di `content/copy/kontak.ts`.
 *    CATATAN: `maxLength` sengaja TIDAK dipakai di isian mana pun — browser memotong
 *    tempelan secara senyap sehingga pesan `terlaluPanjang` mustahil muncul
 *    (aturan 8 di form-kontak.tsx).
 *
 * Sebelumnya angkanya literal di dalam `LeadSchema` dan tidak diekspor, jadi form
 * harus mengetik ulang 2/100/5/100/10/2000 — dua salinan yang bisa melenceng diam-diam
 * (klien mengizinkan, server menolak 422, dan tidak ada yang tahu sampai ada lead hilang).
 *
 * KENAPA BERKAS TERPISAH, BUKAN DI `route.ts`:
 * mengimpor `route.ts` dari client component TERBUKTI menarik seluruh modulnya ke
 * bundel browser — zod + shim `next/server` = satu chunk 373 KB tambahan yang hanya
 * dimuat `/kontak` (diukur 2026-08-25 lewat halaman probe sementara: chunk-nya memuat
 * `ZodError` + `NextResponse` yang tidak ada di rute lain; halaman probenya sekali pakai
 * dan sengaja tidak ikut di-commit). Berkas daun ini
 * membuat form mengimpor tiga angka saja, tanpa satu byte pun kode server.
 * JANGAN menambahkan impor apa pun ke berkas ini — begitu ia menyentuh `next/server`,
 * zod, atau `process.env`, masalah yang sama kembali.
 *
 * Mengubah angka di sini mengubah perilaku SERVER (status 422) sekaligus pesan di
 * browser. Perlakukan seperti perubahan API, bukan perubahan tampilan.
 */
export const BATAS_ISIAN = {
  nama: { min: 2, maks: 100 },
  /** Email atau nomor WhatsApp. */
  kontak: { min: 5, maks: 100 },
  pesan: { min: 10, maks: 2_000 },
} as const;

/**
 * Anggaran kirim `/api/lead` (G-42, menutup H-1 audit ulang G-19 2026-09-26).
 *
 * Latar: mailbox pengirim (`SMTP_USER`, info@bimacreative.tech) dibatasi SERVER surel
 * 30 surel/jam dengan ledakan 10. Tanpa atap di sisi situs, 36 kiriman dari 8 IP
 * menghasilkan 36 surel dalam 0,64 s — jatah jam itu habis dan SETIAP lead asli sesudahnya
 * dibalas 502 sampai jamnya bergulir. Atap di bawah menjaga situs tidak pernah menghabiskan
 * kuota mailbox, sehingga yang ditolak adalah kiriman ke-21 SITUS (dengan jawaban jujur
 * "pindah ke WhatsApp"), bukan surel yang ditolak server di tengah jalan.
 *
 * - `perJam` 20: jendela geser 60 menit, di bawah 30/jam mailbox. Sisa 10/jam (33%) =
 *   margin untuk surel lain dari akun yang sama (owner membalas dari info@) dan untuk
 *   ketidakpastian cara server menghitung jam (jendela tetap vs geser).
 * - `ledakan` 8: kapasitas ember token yang terisi `perJam`/jam. Dalam SETIAP selang t,
 *   kiriman ≤ 8 + 20·t/jam ≤ 10 + 30·t/jam — jadi ember token mailbox (10, 30/jam) tidak
 *   pernah kosong karena situs, termasuk saat ledakan. Margin 2.
 * - `perIpPerHari` 3: per IP tepercaya (IPv6 per /64), jendela 24 jam sejak kiriman
 *   pertama. Tiga kiriman sehari cukup untuk pengunjung yang salah ketik lalu mengulang;
 *   bot satu IP tidak bisa menghabiskan anggaran situs sendirian.
 *
 * Yang dihitung: SETIAP kiriman yang lolos semua pagar sampai titik kirim — kiriman sah DAN
 * kiriman jebakan (honeypot), dicatat di titik yang sama sebelum cabangnya berpisah. Kalau
 * jebakan tidak dihitung, bot bisa membedakannya dari KAPAN atap tersandung.
 * In-memory per proses (satu replika, ADR 2026-09-26); restart = anggaran penuh lagi.
 */
export const ANGGARAN_KIRIM = {
  perJam: 20,
  ledakan: 8,
  perIpPerHari: 3,
} as const;

/**
 * `action` widget Turnstile (G-43). Klien memasangnya saat render, server memeriksa bahwa
 * `action` di jawaban siteverify sama persis — token dari widget/halaman lain ditolak.
 * Aturan Cloudflare: ≤ 32 karakter, alfanumerik/`_`/`-`.
 */
export const AKSI_PEMERIKSAAN = "kontak";
