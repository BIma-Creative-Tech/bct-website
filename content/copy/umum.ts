import type { SlugProduk } from "../site";
import type { CtaWa } from "./types";

/**
 * String lintas halaman: navigasi, footer, tombol WhatsApp mengambang.
 * Disiapkan untuk W1-02 (Nav + Footer + tombol WA floating) supaya frontend-builder
 * tidak perlu menebak label.
 *
 * Nama perusahaan, lokasi, email, dan nomor WA TIDAK ada di sini — ambil dari `site`
 * di content/site.ts. Label produk di menu diambil dari `produk[].nama` (site.ts);
 * `subLabel` di bawah hanya penjelas satu baris untuk menu dropdown.
 */

export type ItemNav = {
  label: string;
  href: string;
};

export type ItemNavProduk = {
  /** Diturunkan dari `produk[]` di content/site.ts — lihat aturan 6 di ./types.ts. */
  slug: SlugProduk;
  href: string;
  /** Penjelas satu baris di menu; nama produknya diambil dari site.ts. */
  subLabel: string;
};

export type GrupFooter = {
  judul: string;
  item: ItemNav[];
};

export const navProduk: ItemNavProduk[] = [
  {
    slug: "bima-insight",
    href: "/produk/bima-insight",
    subLabel: "Tanya data, dapat dashboard",
  },
  {
    slug: "odoo",
    href: "/produk/odoo",
    subLabel: "Implementasi ERP + perawatan",
  },
  {
    slug: "web-apps",
    href: "/produk/web-apps",
    subLabel: "Website & aplikasi custom",
  },
];

export const navUtama: ItemNav[] = [
  { label: "Produk", href: "/produk/bima-insight" }, // pemicu dropdown navProduk
  { label: "Harga", href: "/pricing" },
  { label: "Studi kasus", href: "/studi-kasus" },
  { label: "Tentang", href: "/tentang" },
  { label: "Insight", href: "/insight" }, // aktif setelah W2-06; sembunyikan sampai halaman ada
  { label: "Kontak", href: "/kontak" },
];

export const navCta: CtaWa = {
  label: "Chat WhatsApp",
  pesan: "Halo BCT, saya ingin bertanya soal layanan Anda.",
};

/** Tombol WhatsApp mengambang (muncul di semua halaman). */
export const waMengambang: CtaWa & { ariaLabel: string } = {
  label: "Chat WhatsApp",
  ariaLabel: "Hubungi BCT lewat WhatsApp",
  pesan: "Halo BCT, saya sedang lihat situs Anda dan ingin bertanya.",
};

export type FooterCopy = {
  ringkas: string;
  grup: GrupFooter[];
  catatanHarga: string;
  labelHakCipta: string;
};

export const footer: FooterCopy = {
  /** Satu kalimat di bawah logo. Nama & lokasi perusahaan dari content/site.ts. */
  ringkas:
    "Studio teknologi yang membangun sistem operasional untuk usaha kecil dan menengah Indonesia: ERP, dashboard data, dan aplikasi web.",
  grup: [
    {
      judul: "Produk",
      item: [
        { label: "Dashboard & tanya-data", href: "/produk/bima-insight" },
        { label: "Implementasi Odoo", href: "/produk/odoo" },
        { label: "Website & aplikasi", href: "/produk/web-apps" },
      ],
    },
    {
      judul: "Perusahaan",
      item: [
        { label: "Tentang", href: "/tentang" },
        { label: "Studi kasus", href: "/studi-kasus" },
        { label: "Harga", href: "/pricing" },
        { label: "Kontak", href: "/kontak" },
      ],
    },
  ],
  /** Catatan kecil di baris paling bawah. */
  catatanHarga: "Seluruh harga di situs ini bersifat indikatif dan dikunci di penawaran tertulis.",
  /** Komponen menyusun: © {tahun} {site.name}. Jangan hardcode nama di sini. */
  labelHakCipta: "Hak cipta",
  // [TANYA-OWNER] Untuk footer, belum ada di docs:
  // 1. Nomor legalitas PT (NIB/NPWP) — perlu tayang atau tidak?
  // 2. Apakah perlu tautan Kebijakan Privasi & Syarat Layanan (halaman belum ada di sitemap).
  // 3. Akun media sosial resmi BCT yang boleh ditautkan.
};
