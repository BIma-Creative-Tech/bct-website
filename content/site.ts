/**
 * SATU-SATUNYA sumber kebenaran untuk data situs: kontak, produk, harga.
 * Komponen tidak boleh hardcode angka harga atau nomor WA — impor dari sini.
 * Harga bersifat indikatif sampai divalidasi 3 penawaran pertama (lihat CLAUDE.md).
 */

export const site = {
  name: "Bima Creative Tech",
  shortName: "BCT",
  tagline: "Sistem bisnis modern untuk UKM Indonesia — ERP, dashboard AI, dan aplikasi yang dibangun cepat dan presisi.",
  whatsappNumber: "62XXXXXXXXXXX", // TODO: isi nomor WA bisnis BCT (format internasional tanpa +)
  email: "halo@bimacreative.tech", // TODO: konfirmasi alamat email resmi
  domain: "https://bimacreative.tech", // TODO: konfirmasi domain final
  location: "Depok, Indonesia",
} as const;

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export type Paket = {
  nama: string;
  harga: string;
  satuan?: string;
  deskripsi: string;
  fitur: string[];
  ctaPesan: string; // pesan prefill WhatsApp
};

export type Produk = {
  slug: string;
  nama: string;
  ringkas: string;
  deskripsi: string;
  paket: Paket[];
};

export const produk: Produk[] = [
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
];

export const bukti = [
  { angka: "10+ tahun", label: "pengalaman industri IT & enterprise apps" },
  { angka: "KOMDIGI", label: "webapp perizinan e-Telekomunikasi" },
  { angka: "Retail", label: "domain expertise dari pengalaman langsung" },
] as const;
