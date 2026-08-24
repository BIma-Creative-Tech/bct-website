import type { BlokCta, HeroCopy, KepalaSection, MetaCopy } from "./types";

/**
 * KERANGKA halaman /kontak. Copy sudah final dan siap tayang.
 *
 * PERINGATAN UNTUK FRONTEND-BUILDER:
 * - Nomor WhatsApp, email, dan lokasi TIDAK ada di file ini. Ambil dari `site` di
 *   content/site.ts (`site.whatsappNumber` lewat `waLink()`, `site.email`, `site.location`).
 *   Field `nilaiDari` di bawah menyebut key mana yang harus dipakai.
 * - Nama field form di bawah SUDAH DISAMAKAN dengan skema zod di app/api/lead/route.ts:
 *   nama, kontak, pesan, produk ("bima-insight" | "odoo" | "web-apps" | "lainnya"),
 *   dan honeypot "website". Jangan mengganti nama field tanpa mengubah route-nya.
 * - Field honeypot wajib tersembunyi dari pengguna dan dari pembaca layar
 *   (mis. `aria-hidden` + `tabIndex={-1}` + tidak terlihat), tapi TETAP punya label
 *   untuk bot. Teks label ada di `form.honeypot`.
 */

export type JalurKontak = {
  id: "whatsapp" | "email" | "lokasi";
  label: string;
  teks: string;
  /** Key di objek `site` (content/site.ts) yang menyediakan nilainya. */
  nilaiDari: "whatsappNumber" | "email" | "location";
  /** Teks tombol. Untuk lokasi tidak ada tombol. */
  aksi?: string;
  /** Prefill WhatsApp; hanya untuk id "whatsapp". */
  pesan?: string;
};

export type OpsiProduk = {
  /** Harus persis sama dengan enum `produk` di app/api/lead/route.ts. */
  value: "bima-insight" | "odoo" | "web-apps" | "lainnya";
  label: string;
};

export type FormKontakCopy = {
  kepala: KepalaSection;
  nama: { label: string; placeholder: string };
  kontak: { label: string; bantuan: string; placeholder: string };
  produk: { label: string; bantuan: string; opsi: OpsiProduk[] };
  pesan: { label: string; bantuan: string; placeholder: string };
  honeypot: { label: string };
  tombolKirim: string;
  tombolMengirim: string;
  sukses: string;
  gagal: string;
  gagalRateLimit: string;
  gagalValidasi: string;
  catatanPrivasi: string;
};

export type KontakCopy = {
  meta: MetaCopy;
  hero: HeroCopy;
  jalur: {
    kepala: KepalaSection;
    item: JalurKontak[];
  };
  form: FormKontakCopy;
  penutup: BlokCta;
};

export const kontak: KontakCopy = {
  meta: {
    title: "Kontak",
    description:
      "Hubungi BCT lewat WhatsApp untuk pertanyaan cepat, atau kirim form untuk penawaran. Ceritakan proses bisnis yang paling sering bikin repot.",
  },

  hero: {
    eyebrow: "Kontak",
    judul: "Satu pesan sudah cukup untuk mulai.",
    teks: "Anda tidak perlu menyiapkan brief atau anggaran yang sudah pasti. Ceritakan bagian bisnis yang paling sering bikin repot, dan kami balas dengan pertanyaan yang tepat — bukan brosur.",
    primer: {
      label: "Chat WhatsApp",
      pesan: "Halo BCT, saya ingin bertanya soal layanan Anda.",
    },
    sekunder: {
      label: "Lihat rate card dulu",
      href: "/pricing",
    },
  },

  jalur: {
    kepala: {
      eyebrow: "Cara menghubungi",
      judul: "Pilih jalur yang paling nyaman.",
    },
    item: [
      {
        id: "whatsapp",
        label: "WhatsApp",
        teks: "Jalur paling cepat untuk bertanya, minta perkiraan harga, atau menjadwalkan demo.",
        nilaiDari: "whatsappNumber",
        aksi: "Buka WhatsApp",
        pesan: "Halo BCT, saya ingin bertanya soal layanan Anda.",
      },
      {
        id: "email",
        label: "Email",
        teks: "Untuk penawaran resmi, dokumen pengadaan, dan urusan administrasi.",
        nilaiDari: "email",
        aksi: "Kirim email",
      },
      {
        id: "lokasi",
        label: "Lokasi",
        teks: "Basis operasional kami. Pekerjaan sehari-hari berjalan jarak jauh.",
        nilaiDari: "location",
      },
      // [TANYA-OWNER] Belum ada di docs, jadi sengaja TIDAK ditulis di halaman:
      // 1. Jam operasional / rentang waktu balasan yang berani dijanjikan.
      // 2. Apakah kunjungan atau rapat tatap muka ditawarkan, dan untuk area mana.
      // 3. Alamat kantor lengkap — apakah boleh tayang publik? (site.ts baru berisi kota)
    ],
  },

  form: {
    kepala: {
      eyebrow: "Form",
      judul: "Atau kirim lewat form ini.",
      teks: "Kami hanya meminta data seperlunya. Semakin jelas ceritanya, semakin cepat kami bisa memberi jawaban yang berguna.",
    },
    nama: {
      label: "Nama",
      placeholder: "Nama Anda",
    },
    kontak: {
      label: "Nomor WhatsApp atau email",
      bantuan: "Kami balas lewat jalur yang Anda tulis di sini.",
      placeholder: "08xxxxxxxxxx atau nama@perusahaan.com",
    },
    produk: {
      label: "Yang ingin dibahas",
      bantuan: "Pilih yang paling mendekati. Kalau belum yakin, pilih “Belum tahu, mau diskusi dulu”.",
      opsi: [
        { value: "bima-insight", label: "Dashboard & tanya-data" },
        { value: "odoo", label: "Implementasi Odoo atau perawatannya" },
        { value: "web-apps", label: "Website atau aplikasi custom" },
        { value: "lainnya", label: "Belum tahu, mau diskusi dulu" },
      ],
    },
    pesan: {
      label: "Ceritakan kebutuhan Anda",
      bantuan: "Minimal beberapa kalimat: bisnis Anda bergerak di bidang apa, dan bagian mana yang paling sering bermasalah.",
      placeholder:
        "Contoh: kami distributor dengan tiga gudang. Stok sering selisih dan laporan penjualan baru siap seminggu setelah tutup bulan.",
    },
    honeypot: {
      // Field jebakan bot. Wajib disembunyikan dari pengguna dan pembaca layar.
      label: "Website",
    },
    tombolKirim: "Kirim pesan",
    tombolMengirim: "Mengirim…",
    sukses: "Pesan Anda terkirim. Kami balas lewat kontak yang Anda tulis. Kalau mendesak, silakan lanjut lewat WhatsApp.",
    gagal: "Pesan gagal terkirim. Silakan coba lagi, atau langsung hubungi kami lewat WhatsApp.",
    gagalRateLimit: "Terlalu banyak percobaan dari perangkat ini. Tunggu sebentar, atau hubungi kami lewat WhatsApp.",
    gagalValidasi: "Ada isian yang belum lengkap. Periksa kembali nama, kontak, dan pesan Anda.",
    // Dasar kalimat ini: app/api/lead/route.ts tidak menyimpan data (hanya meneruskan ke
    // LEAD_WEBHOOK_URL) dan SECURITY.md butir 2 (data lead minimal, selaras UU PDP).
    // [TANYA-OWNER] Konfirmasi tujuan LEAD_WEBHOOK_URL nanti bukan tool marketing pihak
    // ketiga — kalau ternyata iya, kalimat privasi ini WAJIB diubah agar tetap jujur.
    catatanPrivasi:
      "Data yang Anda kirim hanya dipakai untuk membalas pertanyaan ini. Kami tidak menyimpannya di database situs dan tidak membagikannya ke pihak lain untuk keperluan pemasaran, sejalan dengan UU PDP No. 27/2022.",
  },

  penutup: {
    eyebrow: "Lebih suka langsung",
    judul: "Kalau butuh cepat, WhatsApp saja.",
    teks: "Pesan singkat pun cukup untuk mulai. Sebutkan bidang usaha Anda dan satu masalah yang paling mengganggu.",
    primer: {
      label: "Chat WhatsApp sekarang",
      pesan: "Halo BCT, saya butuh diskusi cepat soal kebutuhan sistem bisnis saya.",
    },
    sekunder: {
      label: "Lihat semua layanan",
      href: "/pricing",
    },
  },
};
