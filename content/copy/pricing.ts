import type { BlokCta, Faq, HeroCopy, KepalaSection, MetaCopy, Poin } from "./types";

/**
 * Copy halaman /pricing.
 *
 * TIDAK ADA satu pun angka harga di file ini. Seluruh kartu harga dirender dari
 * `produk[].paket` di content/site.ts (nama, harga, satuan, deskripsi, fitur, ctaPesan).
 * Angka yang muncul di sini hanya kebijakan (diskon maks. 20%, DP 50%, kontrak 6 bulan)
 * yang bersumber dari docs/flight-plan.md — bukan harga.
 */

export type PricingCopy = {
  meta: MetaCopy;
  hero: HeroCopy;
  /** Kepala untuk daftar kartu paket; kartunya dari content/site.ts. */
  daftarPaket: KepalaSection;
  kebijakan: {
    kepala: KepalaSection;
    poin: Poin[];
  };
  catatanIndikatif: {
    judul: string;
    teks: string;
  };
  rateCardPdf: {
    kepala: KepalaSection;
    label: string;
    /** Berkas belum ada di repo; blok ini belum dirender — lihat catatan STATUS di bawah (W2-11). */
    href: string;
  };
  faq: {
    kepala: KepalaSection;
    item: Faq[];
  };
  penutup: BlokCta;
};

export const pricing: PricingCopy = {
  meta: {
    title: "Rate card & harga",
    description:
      "Rate card BCT terbuka untuk semua: implementasi Odoo, langganan dashboard data, dan paket website. Diskon maksimal 20%, nego lewat scope bukan harga.",
  },

  hero: {
    eyebrow: "Rate card",
    judul: "Harga kami tertulis. Untuk semua.",
    teks: "Tidak ada “hubungi kami untuk penawaran” sebagai cara menyembunyikan angka. Rate card di halaman ini sama dengan yang dipakai untuk setiap calon klien, siapa pun yang bertanya.",
    primer: {
      label: "Tanya harga untuk kebutuhan saya",
      pesan: "Halo BCT, saya sudah lihat rate card. Bisa bantu perkirakan angkanya untuk kebutuhan saya?",
    },
    sekunder: {
      label: "Lihat cara kerja kami",
      href: "/tentang",
    },
  },

  daftarPaket: {
    eyebrow: "Paket",
    judul: "Semua yang kami jual, beserta angkanya.",
    teks: "Paket berscope tetap punya angka pasti. Pekerjaan yang scope-nya bergantung kondisi Anda ditulis sebagai rentang atau “mulai dari”.",
  },

  kebijakan: {
    kepala: {
      eyebrow: "Kebijakan harga",
      judul: "Enam aturan yang tidak kami langgar.",
      teks: "Aturan ini berlaku sama untuk klien pertama maupun klien kesepuluh. Menuliskannya di depan lebih hemat waktu bagi kita berdua.",
    },
    poin: [
      {
        judul: "Satu rate card untuk semua",
        teks: "Angka yang Anda lihat di halaman ini sama dengan angka yang dilihat calon klien lain. Tidak ada harga khusus yang muncul karena Anda terlihat mampu membayar lebih.",
      },
      {
        judul: "Diskon maksimal 20%, hanya untuk kerabat",
        teks: "Di luar itu tidak ada potongan. Dan kami tidak pernah mengerjakan gratis — pekerjaan gratis selalu jadi pekerjaan yang tidak selesai.",
      },
      {
        judul: "Nego lewat scope, bukan lewat harga",
        teks: "Kalau anggaran belum cocok, yang kami potong adalah bagian pekerjaannya, bukan angkanya. Dengan begitu standar pengerjaan yang tersisa tetap sama.",
      },
      {
        judul: "Harga mengikuti nilai, bukan jam",
        teks: "Anda membayar hasil dan tanggung jawab atas hasil itu, bukan berapa lama kami duduk di depan layar. Jadi kami tidak dirugikan kalau bekerja lebih efisien.",
      },
      {
        judul: "Layanan bulanan berkontrak minimal 6 bulan",
        teks: "Sistem baru butuh beberapa siklus sebelum benar-benar melekat di kebiasaan tim. Kontrak enam bulan menjaga proses itu selesai, bukan berhenti di bulan kedua.",
      },
      {
        judul: "Proyek dimulai dengan DP 50%",
        teks: "Standar yang wajar untuk kedua pihak: kami mengalokasikan waktu dan menolak pekerjaan lain, Anda mendapat kepastian jadwal.",
      },
    ],
  },

  catatanIndikatif: {
    judul: "Angka di halaman ini bersifat indikatif.",
    teks: "Angka final selalu dikunci di penawaran tertulis setelah scope Anda jelas. Kami memilih menampilkan kisaran apa adanya daripada menyembunyikannya — supaya Anda bisa menilai sejak awal apakah kita berada di rentang anggaran yang sama.",
  },

  rateCardPdf: {
    kepala: {
      eyebrow: "Unduh",
      judul: "Perlu versi yang bisa dibawa ke rapat?",
      teks: "Rate card lengkap tersedia dalam satu berkas PDF, isinya sama persis dengan halaman ini.",
    },
    label: "Unduh rate card (PDF)",
    // STATUS (keputusan owner 2026-08-25, saat W2-02): blok ini sengaja TIDAK dirender
    // oleh app/pricing/page.tsx sampai berkas `public/rate-card-bct.pdf` disediakan
    // owner — berkasnya belum ada di repo, dan tombol unduh yang menunjuk berkas kosong
    // lebih merugikan daripada tidak ada tombol sama sekali.
    //
    // JANGAN HAPUS field ini meski untuk sementara nol pemakai: copy dan tipenya sudah
    // final, tinggal disambungkan begitu berkasnya masuk. Penyambungan dilacak sebagai
    // item checklist tersendiri, W2-11 di docs/checklist.md, dan wajib selesai sebelum
    // rilis karena "rate card PDF bisa diunduh" ada di Definition of Done situs.
    href: "/rate-card-bct.pdf",
  },

  faq: {
    kepala: {
      eyebrow: "Pertanyaan",
      judul: "Sebelum Anda bertanya.",
    },
    item: [
      {
        tanya: "Kenapa sebagian harga ditulis sebagai rentang?",
        jawab: "Karena scope-nya memang berbeda-beda antar bisnis: jumlah modul, kerumitan data yang dipindahkan, dan jumlah pengguna. Angka pastinya muncul di penawaran setelah kebutuhan Anda dipetakan.",
      },
      {
        tanya: "Bisa dikerjakan bertahap?",
        jawab: "Bisa, dan biasanya justru itu yang kami sarankan. Mulai dari bagian yang paling mendesak, buktikan dulu bahwa sistemnya dipakai, baru tambah bagian berikutnya.",
      },
      {
        tanya: "Ada diskon untuk pembayaran di muka penuh?",
        jawab: "Tidak ada. Satu-satunya potongan yang kami kenal adalah diskon kerabat maksimal 20%. Kalau anggaran belum cocok, jalannya adalah menyesuaikan scope.",
      },
      // [TANYA-OWNER] Empat pertanyaan berikut sengaja TIDAK ditulis karena jawabannya
      // tidak ada di docs. Kirimkan jawabannya dan akan kami tambahkan sebagai FAQ:
      // 1. Apakah angka di rate card sudah termasuk PPN atau belum termasuk?
      // 2. Kebijakan pembatalan/refund bila proyek dihentikan di tengah jalan.
      // 3. Biaya pihak ketiga yang ditanggung klien (VPS, domain, kuota AI, lisensi).
      // 4. Kebijakan kenaikan harga untuk kontrak recurring — flight-plan Q3 menyebut
      //    rencana menaikkan harga; apakah klien lama dikunci di harga awal?
    ],
  },

  penutup: {
    eyebrow: "Langkah berikutnya",
    judul: "Angka pasti butuh scope yang pasti.",
    teks: "Ceritakan kebutuhan Anda secara ringkas — berapa cabang, sistem apa yang sudah dipakai, apa yang paling mendesak. Kami balas dengan perkiraan angka dan bagian mana yang sebaiknya dikerjakan lebih dulu.",
    primer: {
      label: "Minta perkiraan via WhatsApp",
      pesan: "Halo BCT, saya ingin minta perkiraan harga sesuai kebutuhan bisnis saya.",
    },
    // SEMENTARA (W2-02): aslinya { label: "Lihat studi kasus", href: "/studi-kasus" }.
    // Rute /studi-kasus belum ada (404) sampai W2-03 selesai. Pengalihan ke halaman Odoo
    // dipilih karena paragraf penutup ini soal scope yang menentukan angka, dan Odoo
    // punya rentang terlebar di rate card — halamannya menjelaskan pemetaan proses yang
    // menentukan posisi klien di rentang itu.
    // KEMBALIKAN ke label + href asli begitu W2-03 (halaman /studi-kasus) selesai.
    sekunder: {
      label: "Lihat rincian implementasi Odoo",
      href: "/produk/odoo",
    },
  },
};
