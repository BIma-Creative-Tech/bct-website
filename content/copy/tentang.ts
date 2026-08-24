import type { BlokCta, HeroCopy, KepalaSection, MetaCopy, Poin } from "./types";

/**
 * Copy halaman /tentang.
 *
 * Nama perusahaan, lokasi, dan kontak diambil dari `site` di content/site.ts.
 * Angka bukti diambil dari `bukti[]` di content/site.ts.
 *
 * Sumber fakta: docs/flight-plan.md (tiga mesin bisnis, lima prinsip operasi, aturan
 * harga, gate Odoo SaaS), docs/build-plan.md (urutan Website -> Bima Insight -> Odoo SaaS,
 * DoD ketat + dokumentasi sambil jalan), CLAUDE.md (studio solo, ceruk retail).
 */

export type MesinBisnis = {
  nomor: string;
  nama: string;
  teks: string;
};

export type TentangCopy = {
  meta: MetaCopy;
  hero: HeroCopy;
  posisi: {
    kepala: KepalaSection;
    paragraf: string[];
  };
  siapa: {
    kepala: KepalaSection;
    paragraf: string[];
  };
  mesin: {
    kepala: KepalaSection;
    item: MesinBisnis[];
    catatan: string;
  };
  prinsip: {
    kepala: KepalaSection;
    poin: Poin[];
  };
  rekamJejak: {
    kepala: KepalaSection;
    tautan: { label: string; href: string };
  };
  penutup: BlokCta;
};

export const tentang: TentangCopy = {
  meta: {
    title: "Tentang BCT",
    description:
      "Studio teknologi kecil di Depok yang membangun ERP, dashboard data, dan aplikasi web untuk UKM Indonesia. Dikerjakan langsung oleh engineer-nya.",
  },

  hero: {
    eyebrow: "Tentang kami",
    judul: "Kecil, dan itu memang disengaja.",
    teks: "Kami membangun sistem operasional untuk usaha kecil dan menengah Indonesia. Ruang lingkupnya sengaja sempit: ERP, dashboard data, dan aplikasi web. Pekerjaan yang tidak bisa kami rawat, tidak kami ambil.",
    primer: {
      label: "Kenalan via WhatsApp",
      pesan: "Halo BCT, saya baru baca profil perusahaan Anda dan ingin kenalan.",
    },
    sekunder: {
      label: "Lihat rate card",
      href: "/pricing",
    },
  },

  posisi: {
    kepala: {
      eyebrow: "Posisi",
      judul: "Bukan agensi, bukan software house besar.",
    },
    paragraf: [
      "Kebanyakan usaha kecil di Indonesia berhadapan dengan dua pilihan yang sama-sama tidak nyaman: vendor besar dengan harga korporat dan proses berbulan-bulan, atau freelancer murah yang menghilang setelah invoice terakhir dibayar.",
      "Kami mengambil posisi di antara keduanya. Scope dan harga ditulis di depan seperti produk, pengerjaannya ditangani orang yang benar-benar mengerti sistemnya, dan hubungannya dirancang untuk berlanjut lewat perawatan — bukan berhenti di serah terima.",
      "Konsekuensinya kami harus memilih. Fokus kami retail dan distribusi, ditambah kebutuhan kepatuhan lokal seperti akuntansi dan pajak Indonesia. Di luar itu, kami lebih sering menolak daripada memaksakan.",
    ],
  },

  siapa: {
    kepala: {
      eyebrow: "Siapa yang mengerjakan",
      judul: "Orang yang Anda ajak bicara adalah orang yang menulis kodenya.",
    },
    paragraf: [
      "BCT dijalankan langsung oleh engineer-nya. Tidak ada tim sales yang menjanjikan sesuatu lalu mengoper pekerjaan ke orang lain yang tidak ikut rapat. Pengalaman lebih dari sepuluh tahun di industri IT dan aplikasi enterprise dipakai langsung di pekerjaan Anda, bukan dijadikan bahan brosur.",
      "Kami sampaikan konsekuensinya sejak awal, karena ini akan memengaruhi Anda: kapasitas kami terbatas, jadi hanya satu proyek custom yang berjalan dalam satu waktu. Kalau slotnya sedang terisi, kami katakan apa adanya dan menawarkan jadwal, bukan menerima lalu menggantung.",
      "Yang Anda dapat sebagai gantinya: keputusan teknis diambil oleh orang yang tahu konsekuensinya, dan tidak ada informasi yang hilang di antara lapisan-lapisan koordinasi.",
    ],
    // [TANYA-OWNER] Untuk section ini owner perlu memutuskan:
    // 1. Nama lengkap dan jabatan yang boleh ditampilkan publik.
    // 2. Apakah menampilkan foto profil dan tautan LinkedIn/GitHub.
    // 3. Ringkasan karier satu-dua kalimat (perusahaan/peran yang boleh disebut).
    // 4. Tahun pendirian PT dan nomor legalitas — belum ada di docs, jadi tidak ditulis.
  },

  mesin: {
    kepala: {
      eyebrow: "Cara BCT disusun",
      judul: "Tiga mesin, dan alasannya penting untuk Anda.",
      teks: "Kami terbuka soal bagaimana bisnis ini menghasilkan uang, karena itu yang menentukan apakah kami masih ada saat sistem Anda butuh diperbaiki tahun depan.",
    },
    item: [
      {
        nomor: "01",
        nama: "Mesin kas — jasa berscope tetap",
        teks: "Paket website, implementasi Odoo, dan custom development selektif. Ini yang membiayai operasional hari ini. Karena scope-nya tetap, kami tidak punya insentif memperpanjang proyek.",
      },
      {
        nomor: "02",
        nama: "Mesin recurring — layanan bulanan",
        teks: "Perawatan Odoo dan langganan dashboard data. Ini bagian yang paling kami prioritaskan, karena artinya kami dibayar untuk sistem Anda tetap sehat, bukan hanya untuk membuatnya.",
      },
      {
        nomor: "03",
        nama: "Taruhan skala — Odoo sebagai mesin SaaS",
        teks: "Sedang disiapkan, dan sengaja ditahan sampai basis klien langganan cukup kuat. Kami tidak mau membangun produk besar di atas kas yang belum stabil, lalu memindahkan risikonya ke klien.",
      },
    ],
    catatan:
      "Kenapa ini perlu Anda tahu: vendor yang hidup sepenuhnya dari proyek sekali jadi punya insentif untuk menghilang setelah serah terima. Kami sengaja menyusunnya sebaliknya.",
  },

  prinsip: {
    kepala: {
      eyebrow: "Prinsip operasi",
      judul: "Lima aturan yang mengatur pekerjaan sehari-hari.",
    },
    poin: [
      {
        judul: "Semuanya diproduktisasi",
        teks: "Scope dan harga ditulis di depan. Yang tidak tertulis tidak dikerjakan diam-diam lalu ditagihkan belakangan, dan tidak juga dijanjikan lisan lalu dilupakan.",
      },
      {
        judul: "Recurring lebih dulu",
        teks: "Kami memprioritaskan pekerjaan yang punya kelanjutan. Sistem yang tidak dirawat pasti rusak, dan biaya memperbaikinya selalu lebih mahal daripada merawatnya.",
      },
      {
        judul: "Demo mengalahkan pitch",
        teks: "Lebih baik Anda melihat sistemnya bekerja lima belas menit daripada membaca proposal berpuluh halaman yang isinya belum tentu ada.",
      },
      {
        judul: "Menang di ceruk, bukan di semua tempat",
        teks: "Retail dan distribusi Indonesia, ditambah kepatuhan lokal seperti akuntansi dan pajak. Di ceruk ini kami tahu detail yang tidak terlihat dari luar.",
      },
      {
        judul: "Sistem, bukan niat",
        teks: "Cara kerja kami sendiri dijalankan dengan checklist dan definisi selesai yang tertulis. Kalau kami tidak disiplin di rumah sendiri, Anda tidak akan menerima hasil yang disiplin.",
      },
    ],
  },

  rekamJejak: {
    kepala: {
      eyebrow: "Rekam jejak",
      judul: "Yang bisa kami tunjukkan hari ini.",
      teks: "Kami memilih menampilkan sedikit tapi bisa dipertanggungjawabkan, daripada mendaftar logo yang tidak bisa dijelaskan isinya.",
    },
    tautan: {
      label: "Buka studi kasus",
      href: "/studi-kasus",
    },
  },

  penutup: {
    eyebrow: "Langkah berikutnya",
    judul: "Kalau cara kerja ini masuk akal buat Anda, mari bicara.",
    teks: "Obrolan pertama tidak perlu formal. Cukup ceritakan bisnis Anda dan bagian mana yang sedang paling menyita waktu.",
    primer: {
      label: "Mulai obrolan di WhatsApp",
      pesan: "Halo BCT, saya sudah baca halaman Tentang dan ingin diskusi kebutuhan bisnis saya.",
    },
    sekunder: {
      label: "Lihat semua layanan & harga",
      href: "/pricing",
    },
  },
};
