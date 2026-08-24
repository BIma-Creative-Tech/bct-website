import type { BlokCta, HeroCopy, KepalaSection, Langkah, MetaCopy } from "./types";

/**
 * Copy Beranda.
 *
 * Kartu produk dirender dari `produk[]` di content/site.ts (nama + ringkas).
 * Angka bukti dirender dari `bukti[]` di content/site.ts; `buktiDetail` di bawah
 * hanya menambahkan kalimat penjelas dan dicocokkan lewat field `kunci`.
 */

export type BuktiDetail = {
  /** Cocokkan manual dengan urutan `bukti[]` di content/site.ts. */
  kunci: "pengalaman" | "komdigi" | "retail";
  teks: string;
};

export type BerandaCopy = {
  meta: MetaCopy;
  hero: HeroCopy;
  produk: KepalaSection;
  bukti: {
    kepala: KepalaSection;
    detail: BuktiDetail[];
    tautan: { label: string; href: string };
  };
  caraKerja: {
    kepala: KepalaSection;
    langkah: Langkah[];
  };
  penutup: BlokCta;
};

export const beranda: BerandaCopy = {
  meta: {
    title: "Sistem bisnis untuk UKM Indonesia",
    description:
      "BCT membangun ERP Odoo, dashboard data berbahasa Indonesia, dan aplikasi web untuk UKM. Scope tetap, harga tertulis terbuka, dikerjakan engineer-nya.",
  },

  hero: {
    // Komponen boleh menambahkan `site.location` setelah eyebrow ini.
    eyebrow: "Studio teknologi untuk UKM Indonesia",
    judul: "Sistem yang membuat bisnis Anda tahu, bukan menebak.",
    teks: "Kami merancang dan membangun sistem operasional untuk usaha kecil dan menengah: ERP, dashboard data yang bisa ditanyai dalam Bahasa Indonesia, dan aplikasi web. Scope ditulis di depan, harga terbuka, dan yang mengerjakan adalah orang yang Anda ajak bicara.",
    primer: {
      label: "Konsultasi via WhatsApp",
      pesan: "Halo BCT, saya ingin konsultasi kebutuhan sistem bisnis saya.",
    },
    sekunder: {
      label: "Lihat rate card",
      href: "/pricing",
    },
  },

  produk: {
    eyebrow: "Yang kami kerjakan",
    judul: "Tiga lini, satu tujuan: proses Anda berjalan tanpa tebak-tebakan.",
    teks: "Setiap lini punya scope dan harga tertulis. Anda bisa mulai dari bagian yang paling mendesak, bukan dari paket yang paling besar.",
  },

  bukti: {
    kepala: {
      eyebrow: "Rekam jejak",
      judul: "Bukti dulu, janji belakangan.",
      teks: "Prinsip kerja kami: demo mengalahkan pitch. Ini yang bisa kami buktikan hari ini — selebihnya sebaiknya Anda uji sendiri lewat demo.",
    },
    detail: [
      {
        kunci: "pengalaman",
        teks: "Lebih dari sepuluh tahun membangun dan merawat aplikasi enterprise — termasuk bagian yang jarang dibicarakan vendor: menjaga sistem tetap hidup setelah serah terima.",
      },
      {
        kunci: "komdigi",
        // [TANYA-OWNER] Nama resmi instansi yang boleh ditulis di situs publik: "KOMDIGI" saja,
        // atau nama panjang kementerian? Perlu juga: tahun pengerjaan, peran Ade (lead dev/dev),
        // dan apakah nama proyek boleh disebut publik (izin klien).
        teks: "Aplikasi web perizinan e-Telekomunikasi untuk KOMDIGI — sistem perizinan di lingkungan instansi pemerintah, tempat alur dan aturannya tidak bisa ditawar.",
      },
      {
        kunci: "retail",
        teks: "Pemahaman operasional retail datang dari pengalaman langsung menanganinya, bukan dari riset pasar. Itu sebabnya ceruk ini yang kami pilih.",
      },
    ],
    tautan: {
      label: "Lihat studi kasus",
      href: "/studi-kasus",
    },
  },

  caraKerja: {
    kepala: {
      eyebrow: "Cara kerja",
      judul: "Empat langkah, tanpa proposal tebal.",
      teks: "Kami menjual pekerjaan yang scope-nya jelas. Kalau ada yang tidak masuk akal untuk bisnis Anda, kami sampaikan sejak awal.",
    },
    langkah: [
      {
        nomor: "01",
        judul: "Ceritakan yang macet",
        teks: "Mulai dari satu proses yang paling sering bikin repot. Kami tanya balik sampai jelas apa yang sebenarnya perlu dibeli — dan apa yang tidak perlu.",
      },
      {
        nomor: "02",
        judul: "Lihat demonya",
        teks: "Sesi demo sekitar 15 menit: Anda melihat bentuk sistemnya bekerja, bukan membaca dokumen tebal. Kalau ternyata tidak cocok dengan cara kerja Anda, lebih baik ketahuan sekarang.",
      },
      {
        nomor: "03",
        judul: "Scope dan harga dikunci",
        teks: "Penawaran memuat scope, timeline, dan angka. Kalau anggaran belum cocok, yang kami sesuaikan adalah scope-nya — bukan kualitas pekerjaannya.",
      },
      {
        nomor: "04",
        judul: "Dipakai, lalu dirawat",
        teks: "Proyek dimulai dengan DP 50%. Untuk layanan bulanan, kontrak minimal enam bulan supaya sistemnya benar-benar terawat, bukan sekadar terpasang.",
      },
    ],
  },

  penutup: {
    eyebrow: "Mulai",
    judul: "Cukup satu pertanyaan untuk mulai.",
    teks: "Tidak perlu brief lengkap atau anggaran yang sudah pasti. Ceritakan bagian bisnis yang paling sering bikin repot, dan kami balas dengan langkah termurah untuk memperbaikinya.",
    primer: {
      label: "Chat WhatsApp sekarang",
      pesan: "Halo BCT, ada proses di bisnis saya yang ingin saya perbaiki. Bisa diskusi sebentar?",
    },
    sekunder: {
      label: "Lihat rate card",
      href: "/pricing",
    },
  },
};
