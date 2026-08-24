import type { CtaTautan, CtaWa, MetaCopy } from "./types";
import { navProduk, type ItemNavProduk } from "./umum";

/**
 * Copy halaman 404 (`app/not-found.tsx`). Copy sudah final dan siap tayang.
 *
 * PERINGATAN UNTUK FRONTEND-BUILDER:
 * - `meta.title` DITULIS TANPA SUFFIX. Suffix " — Bima Creative Tech" dipasang
 *   `template` di app/layout.tsx.
 * - CATATAN TEKNIS untuk builder (verifikasi sendiri, ini di luar wewenang penulis copy):
 *   dokumentasi Next di node_modules/next/dist/docs/01-app/03-api-reference/
 *   03-file-conventions/not-found.md HANYA mendokumentasikan ekspor `metadata`
 *   untuk `global-not-found.js`, bukan untuk `not-found.js`. Kalau `meta` di bawah
 *   ternyata tidak terpakai di `app/not-found.tsx`, jangan diam-diam dibuang —
 *   lapor ke lead, karena judul Indonesia inilah inti item W2-09.
 *   (`experimental.globalNotFound` belum aktif di next.config.ts, dan menyalakannya
 *   termasuk gerbang konfirmasi owner.)
 * - Tombol `primer` dirender dengan `waLink(primer.pesan)` dari content/site.ts.
 *   Tidak ada nomor WhatsApp, email, harga, atau nama produk di file ini.
 * - `tautanBantu` sengaja memakai ulang `navProduk` dari ./umum: nama produknya
 *   diambil dari `produk[].nama` di content/site.ts lewat `slug`, bukan diketik di sini.
 * - JANGAN menambah tautan ke /pricing, /studi-kasus, /tentang, /kontak, atau /insight
 *   dari halaman ini. Per 2026-08-24 rute-rute itu masih 404 — menautkannya berarti
 *   mengirim pengunjung dari 404 ke 404. Tambahkan kembali setelah halamannya hidup.
 */

export type TidakDitemukanCopy = {
  meta: MetaCopy;
  /** Penanda besar di atas judul. Dirender sebagai teks dekoratif (beri aria-hidden). */
  kode: string;
  judul: string;
  teks: string;
  primer: CtaWa;
  /** Selalu ke beranda — satu-satunya rute yang pasti hidup. */
  sekunder: CtaTautan;
  /** Kepala daftar tautan bantu. */
  judulTautanBantu: string;
  /** Hanya rute yang sudah hidup. Lihat peringatan di atas sebelum menambah item. */
  tautanBantu: ItemNavProduk[];
};

export const tidakDitemukan: TidakDitemukanCopy = {
  meta: {
    title: "Halaman tidak ditemukan",
    description:
      "Alamat yang Anda buka tidak ada di situs kami. Kembali ke beranda, lihat halaman produk, atau tanyakan langsung lewat WhatsApp.",
  },

  kode: "404",

  judul: "Alamat ini tidak menuju halaman mana pun.",

  teks: "Bisa jadi tautannya salah dari sisi kami, halamannya sudah pindah, atau bagian situs ini memang belum selesai kami bangun. Daripada Anda menebak-nebak sendiri, tanyakan saja langsung — lewat chat biasanya lebih cepat ketemu jawabannya.",

  primer: {
    label: "Tanya lewat WhatsApp",
    // Pesan ini sengaja berdiri sendiri supaya not-found.tsx tetap Server Component.
    // OPSIONAL, boleh dilewati: kalau ingin menambahkan path yang gagal di belakang
    // pesan (agar tautan rusaknya bisa kami perbaiki), itu butuh `usePathname` alias
    // Client Component. Kalau ditempuh, kirim pathname saja — jangan query string,
    // karena bisa memuat data pribadi pengunjung.
    pesan: "Halo BCT, saya membuka satu halaman di situs Anda yang tidak ditemukan. Bisa bantu arahkan ke informasi yang saya cari?",
  },

  sekunder: {
    label: "Kembali ke beranda",
    href: "/",
  },

  judulTautanBantu: "Yang mungkin Anda cari",

  tautanBantu: navProduk,

  // [TANYA-OWNER] Belum ada di docs/flight-plan.md maupun docs/build-plan.md:
  // apakah BCT punya alamat/URL lama (situs atau materi cetak yang sudah beredar)
  // yang perlu diarahkan ulang? Kalau ada, lebih baik dibuat redirect permanen
  // daripada dibiarkan mendarat di halaman ini.
};
