/**
 * SATU-SATUNYA sumber kebenaran untuk data situs: kontak, produk, harga.
 * Komponen tidak boleh hardcode angka harga atau nomor WA — impor dari sini.
 * Harga bersifat indikatif sampai divalidasi 3 penawaran pertama (lihat CLAUDE.md).
 */

export const site = {
  name: "Bima Creative Tech",
  shortName: "BCT",
  tagline: "Sistem bisnis modern untuk UKM Indonesia — ERP, dashboard AI, dan aplikasi yang dibangun cepat dan presisi.",
  whatsappNumber: "6285640718785",
  email: "am.ademaryadi@gmail.com",
  // Domain TIDAK lagi di sini (ADR 2026-09-26): URL publik kanonik = env `SITE_URL`
  // runtime (lib/env.ts, lib/site.ts) — metadataBase, canonical, og:url, sitemap, robots.
  location: "",
} as const;

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * `readonly` di seluruh field bukan gaya-gayaan: `produk` di bawah dideklarasikan
 * `as const` (lihat alasannya di sana), sehingga nilainya bertipe deeply readonly.
 * Kedua tipe ini harus ikut readonly agar `satisfies` di bawah tetap cocok, dan
 * agar komponen yang menerima potongan datanya tidak menjanjikan bisa memutasinya.
 */
export type Paket = {
  readonly nama: string;
  readonly harga: string;
  readonly satuan?: string;
  readonly deskripsi: string;
  readonly fitur: readonly string[];
  readonly ctaPesan: string; // pesan prefill WhatsApp
};

export type Produk = {
  readonly slug: string;
  readonly nama: string;
  readonly ringkas: string;
  readonly deskripsi: string;
  readonly paket: readonly Paket[];
};

/**
 * `as const satisfies readonly Produk[]`, BUKAN `: Produk[]` — dua efek yang
 * dibutuhkan sekaligus:
 *
 * 1. `satisfies` tetap memeriksa setiap entri terhadap bentuk `Produk`, jadi field
 *    yang kurang atau salah tipe tetap ditolak compiler seperti sebelumnya.
 * 2. `as const` menahan literal `slug` agar tidak melebar jadi `string`, sehingga
 *    `SlugProduk` di bawah bisa DITURUNKAN dari data ini.
 *
 * Kenapa penting (W2-10 butir b, temuan qa-reviewer 2026-08-26): selama `slug`
 * bertipe `string`, union slug di `content/copy/types.ts` ditulis tangan dan tidak
 * terhubung ke berkas ini — produk keempat bisa ditambahkan TANPA copy dan build
 * tetap hijau, lalu produk tanpa copy itu ikut terender ke beranda dan /pricing.
 * Dengan bentuk sekarang, `produkCopy: Record<SlugProduk, ProdukCopy>` di
 * `content/copy/index.ts` langsung gagal (TS2741) menyebut slug yang copy-nya hilang.
 *
 * Konsekuensi yang harus dipatuhi: nilai di sini hanya boleh dibaca. Komponen yang
 * menerima `produk[].paket` atau `paket[].fitur` mendeklarasikan prop-nya sebagai
 * `readonly` (mis. components/sections/daftar-paket.tsx, daftar-tanda.tsx).
 */
export const produk = [
  {
    slug: "bima-insight",
    nama: "Bima Insight",
    ringkas: "Tanya data bisnis Anda dalam Bahasa Indonesia — jawabannya langsung jadi dashboard.",
    deskripsi:
      "Bima Insight terhubung ke database yang sudah Anda punya (read-only, aman), memahami struktur datanya, lalu menjawab pertanyaan bisnis — omzet per cabang, stok menipis, tren penjualan — sebagai chart interaktif yang bisa disusun jadi dashboard. Bisa ditempelkan ke aplikasi yang sudah ada.",
    paket: [
      {
        nama: "Insight Standard",
        harga: "Rp 2,5 jt",
        satuan: "/bulan",
        deskripsi: "Untuk satu sumber data dan tim kecil.",
        fitur: ["1 koneksi database", "Chat tanya-data Bahasa Indonesia", "Dashboard interaktif", "5 pengguna"],
        ctaPesan: "Halo BCT, saya tertarik paket Bima Insight Standard.",
      },
      {
        nama: "Insight Pro",
        harga: "Rp 7,5 jt",
        satuan: "/bulan",
        deskripsi: "Multi sumber data, embed ke aplikasi existing, laporan terjadwal.",
        fitur: ["Hingga 3 koneksi database", "Embed dashboard/chat ke aplikasi Anda", "Laporan terjadwal (email/WA)", "Pengguna tak terbatas", "Dukungan prioritas"],
        ctaPesan: "Halo BCT, saya tertarik paket Bima Insight Pro.",
      },
    ],
  },
  {
    slug: "odoo",
    nama: "Odoo ERP",
    ringkas: "Implementasi Odoo paket UMKM + perawatan bulanan — termasuk kepatuhan pajak Indonesia.",
    deskripsi:
      "Implementasi Odoo Community dengan scope dan timeline tetap, disesuaikan proses bisnis Anda: penjualan, pembelian, stok, akuntansi dengan CoA PSAK dan PPN. Tersedia frontend modern berbasis Next.js sebagai pembeda, dan Odoo Care agar sistem terawat tanpa Anda pusing.",
    paket: [
      {
        nama: "Implementasi UMKM",
        harga: "Rp 25–75 jt",
        deskripsi: "Modul standar, timeline tetap, pelatihan tim.",
        fitur: ["Analisa kebutuhan bisnis", "Setup modul standar (sales, purchase, inventory, accounting)", "CoA Indonesia + PPN", "Migrasi data awal", "Pelatihan pengguna"],
        ctaPesan: "Halo BCT, saya ingin konsultasi implementasi Odoo untuk bisnis saya.",
      },
      {
        nama: "Odoo Care",
        harga: "Rp 1,5–5 jt",
        satuan: "/bulan",
        deskripsi: "Hosting terkelola, backup, update, dan jam support.",
        fitur: ["Hosting terkelola + monitoring", "Backup harian", "Patch & update rutin", "Jam support bulanan", "Laporan kesehatan sistem"],
        ctaPesan: "Halo BCT, saya tertarik retainer Odoo Care.",
      },
    ],
  },
  {
    slug: "web-apps",
    nama: "Web & Apps",
    ringkas: "Website company profile dengan AI chat, sampai aplikasi web/mobile custom.",
    deskripsi:
      "Paket website company profile berharga tetap yang selesai ±2 minggu — sudah termasuk AI chat berbahasa Indonesia. Untuk kebutuhan khusus, tersedia custom development web dan mobile secara selektif dengan kontrak maintenance.",
    paket: [
      {
        nama: "Company Profile + AI Chat",
        harga: "Rp 5–15 jt",
        deskripsi: "Scope tetap, selesai ±2 minggu.",
        fitur: ["Desain modern responsive", "AI chat Bahasa Indonesia", "SEO dasar", "Form lead + WhatsApp", "Maintenance opsional Rp 300–750 rb/bln"],
        ctaPesan: "Halo BCT, saya tertarik paket website Company Profile + AI Chat.",
      },
      {
        nama: "Custom Development",
        harga: "mulai Rp 40 jt",
        deskripsi: "Web app / mobile app sesuai kebutuhan — selektif, dengan kontrak maintenance.",
        fitur: ["Analisa kebutuhan mendalam", "Web (Next.js) / Mobile (Flutter)", "Wajib kontrak maintenance", "Maksimal satu proyek berjalan — kualitas dijaga"],
        ctaPesan: "Halo BCT, saya ingin diskusi kebutuhan custom development.",
      },
    ],
  },
] as const satisfies readonly Produk[];

/**
 * Union slug produk — DITURUNKAN dari `produk` di atas, jangan pernah ditulis ulang.
 *
 * Ini pengikat antara sumber kebenaran (berkas ini) dan copy: `ProdukCopy["slug"]`
 * di `content/copy/types.ts` dan `ItemNavProduk["slug"]` di `content/copy/umum.ts`
 * memakai tipe ini, sehingga menambah/menghapus produk di sini otomatis menuntut
 * copy dan item nav-nya menyusul — ketahuan saat `tsc`/`next build`, bukan saat
 * pengunjung melihat produk tanpa halaman.
 */
export type SlugProduk = (typeof produk)[number]["slug"];

/**
 * Satu butir rekam jejak. `readonly` di tiap field karena `bukti` di bawah
 * dideklarasikan `as const` — alasannya sama dengan `Produk`/`Paket` di atas.
 */
export type Bukti = {
  /** Kunci pemasangan ke kalimat penjelas di copy. BUKAN teks yang tayang. */
  readonly kunci: string;
  readonly angka: string;
  readonly label: string;
};

/**
 * `as const satisfies readonly Bukti[]` — alasannya persis sama dengan `produk`
 * di atas: `satisfies` menjaga bentuk tiap entri, `as const` menahan literal
 * `kunci` agar `KunciBukti` di bawah bisa DITURUNKAN dari data ini.
 *
 * `kunci` ada karena beranda memasangkan angka+label ini dengan kalimat penjelas
 * di `beranda.bukti.detail` (content/copy/beranda.ts). Sebelum G-24 pemasangan itu
 * memakai INDEKS array: menukar dua baris di bawah membuat angka "KOMDIGI"
 * berpasangan dengan paragraf milik "10+ tahun", dan lint/tsc/build tetap exit 0
 * (diukur qa-reviewer 2026-08-26). Sekarang pasangannya ditentukan `kunci`, jadi
 * urutan baris di sini hanya mengatur URUTAN TAYANG — bukan siapa berpasangan
 * dengan siapa.
 */
export const bukti = [
  { kunci: "pengalaman", angka: "10+ tahun", label: "pengalaman industri IT & enterprise apps" },
  { kunci: "komdigi", angka: "KOMDIGI", label: "webapp perizinan e-Telekomunikasi" },
  { kunci: "retail", angka: "Retail", label: "domain expertise dari pengalaman langsung" },
] as const satisfies readonly Bukti[];

/**
 * Angka ringkas di bawah tombol hero beranda. Sumber: owner, 2026-09-24
 * ("Project 30+, Client 10+, Pengalaman 10+"). Ubah angkanya HANYA di sini.
 * `pengalaman` sengaja sama dengan `bukti[kunci="pengalaman"]` (10+ tahun) —
 * bila salah satunya berubah, ubah keduanya.
 */
export type Statistik = {
  readonly kunci: string;
  readonly angka: string;
  readonly label: string;
};

export const statistik = [
  { kunci: "proyek", angka: "30+", label: "Total proyek" },
  { kunci: "klien", angka: "10+", label: "Total klien" },
  { kunci: "pengalaman", angka: "10+ tahun", label: "Total pengalaman" },
] as const satisfies readonly Statistik[];

/**
 * Union kunci bukti — DITURUNKAN dari `bukti` di atas, jangan pernah ditulis ulang.
 *
 * Pengikat antara berkas ini dan copy: `BuktiDetail` di content/copy/beranda.ts
 * adalah `Record<KunciBukti, string>`, sehingga menambah butir di sini tanpa menulis
 * kalimatnya — atau menghapus butir dan meninggalkan kalimat yatim — membuat
 * `tsc`/`next build` GAGAL sambil menyebut kuncinya, bukan diam-diam terbit.
 */
export type KunciBukti = (typeof bukti)[number]["kunci"];
