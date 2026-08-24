import type { ProdukCopy } from "./types";

/**
 * Copy halaman /produk/web-apps.
 *
 * Nama paket dan angka harga (termasuk biaya maintenance bulanan) TIDAK ditulis di sini —
 * dirender dari `produk[]` di content/site.ts.
 *
 * Sumber fakta: content/site.ts (scope tetap ±2 minggu, AI chat Bahasa Indonesia, SEO
 * dasar, form lead + WhatsApp, maintenance opsional, custom Next.js/Flutter, wajib kontrak
 * maintenance, maksimal satu proyek berjalan) dan docs/flight-plan.md (mesin kas,
 * custom selektif harga premium, DP 50%, nego lewat scope).
 */

export const webApps: ProdukCopy = {
  slug: "web-apps",

  meta: {
    title: "Website & aplikasi custom",
    description:
      "Paket website company profile berscope tetap dengan AI chat Bahasa Indonesia, selesai sekitar dua minggu. Custom web dan mobile diambil selektif.",
  },

  hero: {
    eyebrow: "Produk · Web & aplikasi",
    judul: "Website yang tugasnya jelas: memulai percakapan.",
    teks: "Paket company profile dengan scope tetap yang dirancang selesai sekitar dua minggu, sudah termasuk AI chat berbahasa Indonesia dan jalur langsung ke WhatsApp. Untuk kebutuhan di luar itu, kami menerima pekerjaan custom secara selektif.",
    primer: {
      label: "Tanya paket website",
      pesan: "Halo BCT, saya ingin tanya soal paket website untuk bisnis saya.",
    },
    sekunder: {
      label: "Lihat rate card",
      href: "/pricing",
    },
  },

  masalah: {
    kepala: {
      eyebrow: "Masalah",
      judul: "Punya website bukan berarti dapat pelanggan.",
      teks: "Empat keluhan yang paling sering kami dengar sebelum orang mengganti situsnya.",
    },
    poin: [
      {
        judul: "Ada websitenya, tidak ada yang menghubungi",
        teks: "Biasanya karena pengunjung tidak pernah diberi tahu apa langkah berikutnya. Setiap halaman perlu diakhiri satu ajakan yang konkret, bukan sekadar informasi.",
      },
      {
        judul: "Proyeknya tidak pernah selesai",
        teks: "Revisi tanpa batas, materi yang tak kunjung dikirim, tenggat yang mundur terus. Scope tetap dan daftar materi yang jelas menyelesaikan sebagian besar masalah ini.",
      },
      {
        judul: "Pertanyaan datang di luar jam kerja",
        teks: "Calon pelanggan bertanya hal yang sama berulang-ulang, sering malam hari. AI chat berbahasa Indonesia menjawab yang berulang dan mengarahkan yang serius ke WhatsApp Anda.",
      },
      {
        judul: "Aplikasi custom ditinggal vendornya",
        teks: "Aplikasi jadi, vendor menghilang, tidak ada yang berani menyentuh kodenya. Karena itu kami hanya menjalankan satu proyek custom dalam satu waktu dan mensyaratkan kontrak perawatan.",
      },
    ],
  },

  caraKerja: {
    kepala: {
      eyebrow: "Cara kerja",
      judul: "Yang Anda dapat di paket company profile.",
      teks: "Scope-nya tetap dan tertulis. Kalau ada kebutuhan di luar daftar ini, dihitung terpisah dan disepakati sebelum dikerjakan.",
    },
    langkah: [
      {
        nomor: "01",
        judul: "Struktur yang mengarah ke satu tujuan",
        teks: "Setiap halaman disusun untuk berakhir pada satu ajakan konkret. Situs yang sedang Anda baca ini dibangun dengan aturan yang sama.",
      },
      {
        nomor: "02",
        judul: "Desain responsif, mobile-first",
        teks: "Dirancang dari layar ponsel dulu, baru disesuaikan untuk layar besar — bukan sebaliknya, seperti kebanyakan template.",
      },
      {
        nomor: "03",
        judul: "AI chat Bahasa Indonesia",
        teks: "Menjawab pertanyaan berulang tentang layanan Anda dan mengarahkan calon pelanggan yang serius ke jalur yang Anda inginkan.",
      },
      {
        nomor: "04",
        judul: "SEO dasar dan form lead",
        teks: "Metadata tiap halaman, sitemap, dan form yang masuk ke email Anda — dengan tombol WhatsApp sebagai jalur cepat untuk yang tidak mau mengisi form.",
      },
      {
        nomor: "05",
        judul: "Serah terima dan perawatan opsional",
        teks: "Anda menerima situs yang siap jalan. Perawatan bulanan tersedia sebagai layanan terpisah untuk update konten kecil dan menjaga situs tetap sehat.",
      },
    ],
  },

  tambahan: [
    {
      id: "custom",
      kepala: {
        eyebrow: "Di luar paket",
        judul: "Custom development, diambil selektif.",
        teks: "Untuk kebutuhan yang tidak bisa diselesaikan paket standar: aplikasi web dengan Next.js atau aplikasi mobile dengan Flutter. Empat syarat yang kami pegang.",
      },
      daftar: [
        "Dimulai dari analisa kebutuhan yang mendalam, bukan langsung dari daftar fitur.",
        "Maksimal satu proyek custom berjalan dalam satu waktu — supaya perhatiannya penuh.",
        "Kontrak perawatan wajib; kami tidak menyerahkan aplikasi lalu menghilang.",
        "Harga di kelas premium, dengan DP 50% sebelum pekerjaan dimulai.",
      ],
    },
  ],

  untukSiapa: {
    kepala: {
      eyebrow: "Untuk siapa",
      judul: "Cocok untuk sebagian bisnis, tidak untuk semua.",
    },
    labelCocok: "Cocok kalau",
    cocok: [
      "Anda sudah punya pelanggan, tapi belum punya halaman yang pantas dikirim ke calon klien besar.",
      "Perusahaan Anda ikut tender atau kerja sama dan butuh profil resmi yang kredibel.",
      "Pertanyaan calon pelanggan berulang dan menyita waktu tim Anda setiap hari.",
      "Proses kerja Anda cukup unik sehingga spreadsheet sudah kehabisan akal — itu wilayah custom development.",
    ],
    labelBelumCocok: "Belum cocok kalau",
    belumCocok: [
      "Anda butuh banyak landing page murah tiap bulan; kami bukan vendor volume.",
      "Materi dasar seperti daftar layanan, harga, dan kontak belum ada dan belum ingin disiapkan.",
      "Untuk custom development: tidak ada rencana anggaran perawatan setelah aplikasi jadi.",
    ],
  },

  paket: {
    eyebrow: "Harga",
    judul: "Paket berscope tetap, custom mulai dari angka tertulis.",
    teks: "Proyek dimulai dengan DP 50%. Angka di bawah bersifat indikatif dan dikunci di penawaran tertulis setelah kebutuhan Anda jelas.",
  },

  faq: {
    kepala: {
      eyebrow: "Pertanyaan",
      judul: "Yang paling sering ditanyakan.",
    },
    item: [
      {
        tanya: "Berapa lama paket company profile selesai?",
        jawab: "Scope-nya disiapkan untuk selesai sekitar dua minggu. Kecepatan nyatanya sangat bergantung pada seberapa cepat materi dari Anda — teks, foto, logo — masuk ke kami.",
      },
      {
        tanya: "Bisa lanjut ke aplikasi setelah websitenya jadi?",
        jawab: "Bisa. Custom development kami ambil secara selektif dengan maksimal satu proyek berjalan pada satu waktu, dan disertai kontrak perawatan. Kalau slotnya sedang terisi, kami akan bilang apa adanya.",
      },
      {
        tanya: "Pembayarannya bagaimana?",
        jawab: "Proyek dimulai setelah DP 50% masuk. Rinciannya tertulis di penawaran, termasuk apa yang menjadi tanggung jawab Anda dan apa yang menjadi tanggung jawab kami.",
      },
      {
        tanya: "Kalau anggaran kami belum sampai?",
        jawab: "Kami menyesuaikan scope, bukan menurunkan harga per pekerjaan. Artinya jumlah halaman atau fiturnya yang dikurangi, sementara standar pengerjaannya tetap sama.",
      },
      // [TANYA-OWNER] Belum bisa dijawab dari docs, jadi sengaja TIDAK ditulis:
      // 1. Apakah penulisan copy/konten dan pengadaan foto termasuk dalam paket, atau
      //    disiapkan klien? (site.ts tidak menyebutkannya)
      // 2. Sumber jawaban AI chat: hanya isi situs, atau bisa diberi dokumen tambahan?
      //    Ada batas jumlah percakapan per bulan?
      // 3. Biaya domain dan hosting: termasuk paket atau ditagih terpisah ke klien?
      // 4. Berapa kali putaran revisi yang termasuk dalam scope tetap?
    ],
  },

  penutup: {
    eyebrow: "Langkah berikutnya",
    judul: "Kirim tautan situs lama Anda, atau ceritakan idenya.",
    teks: "Kalau sudah ada situs, kami sebutkan tiga hal yang paling mungkin membuatnya tidak menghasilkan. Kalau belum ada, cukup ceritakan bisnisnya.",
    primer: {
      label: "Chat WhatsApp",
      pesan: "Halo BCT, saya ingin diskusi soal website atau aplikasi untuk bisnis saya.",
    },
    sekunder: {
      label: "Lihat rate card",
      href: "/pricing",
    },
  },
};
