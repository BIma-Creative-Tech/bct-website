import type { ProdukCopy } from "./types";

/**
 * Copy halaman /produk/bima-insight.
 *
 * Nama produk sengaja ditulis literal HANYA di `meta.title`; body copy menghindarinya
 * supaya nama tetap bersumber dari `produk[]` di content/site.ts.
 * Kartu paket (nama, harga, fitur, ctaPesan) dirender dari content/site.ts.
 *
 * Sumber fakta copy ini: docs/build-plan.md (arsitektur 5 layer, read-only + SELECT-only
 * + LIMIT + timeout, knowledge store berversi, embed & REST API, M1 hanya PostgreSQL +
 * MySQL, enkripsi + audit log + masking UU PDP) dan docs/flight-plan.md (flagship
 * recurring, prototipe Q1, 3 pilot berbayar Q2).
 */

export const bimaInsight: ProdukCopy = {
  slug: "bima-insight",

  meta: {
    title: "Bima Insight: tanya data bisnis Anda",
    description:
      "Tanya data bisnis dalam Bahasa Indonesia, jawabannya jadi dashboard. Koneksi read-only ke PostgreSQL atau MySQL, dengan audit log dan masking.",
  },

  hero: {
    eyebrow: "Produk · Dashboard & tanya-data",
    judul: "Data Anda sudah lengkap. Jawabannya yang belum ada.",
    teks: "Sambungkan database yang sudah Anda pakai dengan akses baca-saja. Ajukan pertanyaan bisnis dalam Bahasa Indonesia — omzet per cabang, stok yang menipis, tren tiga bulan terakhir — dan jawabannya keluar sebagai chart yang bisa Anda simpan jadi dashboard.",
    primer: {
      label: "Minta demo lewat WhatsApp",
      pesan: "Halo BCT, saya ingin lihat demo dashboard tanya-data untuk data bisnis saya.",
    },
    sekunder: {
      label: "Lihat harga langganan",
      href: "/pricing",
    },
  },

  // [TANYA-OWNER] Setujui kalimat status ini untuk tayang publik. Dasar: flight-plan
  // (prototipe Q1 Sep-Nov 2026, 3 pilot berbayar Q2 Des 2026-Feb 2027). Kalau owner
  // ingin menyembunyikan status pra-rilis, hapus field ini — jangan diganti klaim "sudah rilis".
  catatanStatus:
    "Produk ini sedang dalam pengembangan aktif. Slot pilot berbayar dibuka terbatas untuk bisnis yang mau ikut membentuk bentuk akhirnya.",

  masalah: {
    kepala: {
      eyebrow: "Masalah",
      judul: "Angka ada di database. Yang tidak ada: cara mengambilnya.",
      teks: "Empat keluhan yang paling sering kami dengar dari pemilik usaha yang sistemnya sudah jalan.",
    },
    poin: [
      {
        judul: "Setiap laporan harus lewat orang lain",
        teks: "Mau tahu angka sederhana pun harus menunggu tim IT, vendor, atau ekspor manual ke spreadsheet. Pertanyaan mendesak jadi tertunda berhari-hari.",
      },
      {
        judul: "Dashboard sudah dibeli, tapi mati",
        teks: "Banyak tool analitik menuntut orang yang paham query untuk merakit dan merawatnya. Begitu orang itu sibuk atau pindah, dashboardnya berhenti dipakai.",
      },
      {
        judul: "Data terpencar di beberapa sistem",
        teks: "Penjualan di satu aplikasi, stok di aplikasi lain, keuangan di tempat ketiga. Menyatukannya biasanya terdengar seperti proyek migrasi besar.",
      },
      {
        judul: "Membuka akses database terasa berisiko",
        teks: "Wajar. Database berisi data pelanggan, dan memberi akses ke pihak luar tanpa batas yang jelas memang tidak boleh dilakukan.",
      },
    ],
  },

  caraKerja: {
    kepala: {
      eyebrow: "Cara kerja",
      judul: "Lima lapis, dari kredensial sampai dashboard.",
      teks: "Tidak ada migrasi data dan tidak ada aplikasi yang perlu Anda ganti. Yang dibaca adalah database yang sudah berjalan hari ini.",
    },
    langkah: [
      {
        nomor: "01",
        judul: "Koneksi baca-saja",
        teks: "Anda memberi kredensial read-only. Sistem hanya bisa menjalankan SELECT, dengan batas jumlah baris dan batas waktu eksekusi. Tidak ada perintah tulis, ubah, atau hapus.",
      },
      {
        nomor: "02",
        judul: "Skema dibaca, makna dipetakan",
        teks: "Struktur tabel diintrospeksi otomatis, lalu kami isi maknanya: arti tiap tabel dan kolom, relasi antar tabel, dan rumus metrik yang Anda pakai sehari-hari.",
      },
      {
        nomor: "03",
        judul: "Pertanyaan Bahasa Indonesia jadi query",
        teks: "Pertanyaan Anda diterjemahkan menjadi SQL, divalidasi dulu, baru dijalankan. Hasilnya kembali sebagai angka dan chart, bukan tabel mentah.",
      },
      {
        nomor: "04",
        judul: "Chart disusun jadi dashboard",
        teks: "Jawaban yang berguna bisa disimpan dan disusun ulang jadi dashboard interaktif — cukup seret dan tata sesuai kebiasaan membaca Anda.",
      },
      {
        nomor: "05",
        judul: "Tempel ke aplikasi yang sudah ada",
        teks: "Dashboard dan kolom tanya-data bisa disematkan ke aplikasi Anda yang sudah berjalan, atau diambil datanya lewat REST API.",
      },
    ],
  },

  tambahan: [
    {
      id: "keamanan",
      kepala: {
        eyebrow: "Keamanan data",
        judul: "Batasannya teknis, bukan sekadar janji di kontrak.",
        teks: "Lima pembatas yang berlaku sejak koneksi pertama dibuat.",
      },
      daftar: [
        "Kredensial yang dipakai wajib read-only — hak tulis tidak pernah diminta.",
        "Eksekutor query hanya menerima SELECT, dengan LIMIT dan timeout wajib.",
        "Kredensial koneksi disimpan dalam keadaan terenkripsi.",
        "Setiap query yang dijalankan tercatat di audit log dan bisa Anda telusuri.",
        "Kolom sensitif dapat dimasking, mengikuti kewajiban UU PDP No. 27/2022.",
      ],
    },
    {
      id: "knowledge",
      kepala: {
        eyebrow: "Yang membuatnya akurat",
        judul: "Pemetaan makna data disimpan berversi.",
        teks: "Jawaban yang keliru hampir selalu berasal dari makna data yang belum terpetakan — misalnya kolom status yang isinya kode internal, atau dua tabel penjualan yang salah satunya arsip. Definisi tabel, kolom, relasi, dan rumus metrik disimpan per klien dan berversi, jadi setiap koreksi langsung mengubah kualitas jawaban berikutnya dan bisa dilacak riwayatnya.",
      },
    },
  ],

  untukSiapa: {
    kepala: {
      eyebrow: "Untuk siapa",
      judul: "Cocok untuk sebagian bisnis, tidak untuk semua.",
    },
    labelCocok: "Cocok kalau",
    cocok: [
      "Anda menanyakan angka yang sama ke staf setiap minggu, dan jawabannya selalu lama.",
      "Bisnis Anda retail atau distribusi dengan beberapa cabang, gudang, atau kanal penjualan.",
      "Sudah ada aplikasi yang berjalan — kasir, ERP, atau aplikasi internal — dan datanya di PostgreSQL atau MySQL.",
      "Anda ingin menempelkan dashboard ke aplikasi yang sudah dipakai tim, bukan menambah satu aplikasi baru lagi.",
    ],
    labelBelumCocok: "Belum cocok kalau",
    belumCocok: [
      "Pencatatan Anda masih di spreadsheet dan belum ada database — benahi dulu pencatatannya.",
      "Sumber datanya bukan PostgreSQL atau MySQL; dukungan sumber lain baru dipertimbangkan setelah versi pertama stabil.",
      "Yang Anda cari adalah laporan sekali jadi, bukan alat yang dipakai rutin.",
    ],
  },

  paket: {
    eyebrow: "Harga",
    judul: "Langganan bulanan, kontrak minimal enam bulan.",
    teks: "Angka di bawah bersifat indikatif dan dikunci di penawaran tertulis setelah sumber data Anda dipetakan.",
  },

  faq: {
    kepala: {
      eyebrow: "Pertanyaan",
      judul: "Yang paling sering ditanyakan.",
    },
    item: [
      {
        tanya: "Database apa saja yang didukung sekarang?",
        jawab: "Versi pertama mendukung PostgreSQL dan MySQL. Sumber data lain baru dipertimbangkan setelah versi pertama terbukti stabil di klien nyata — kami memilih tidak menjanjikan konektor yang belum ada.",
      },
      {
        tanya: "Apakah aplikasi kami yang sekarang harus diganti?",
        jawab: "Tidak. Sistem ini membaca database yang sudah Anda pakai, tidak menggantikan aplikasinya. Dashboard dan kolom tanya-data bahkan bisa ditempelkan ke aplikasi tersebut lewat embed atau REST API.",
      },
      {
        tanya: "Seberapa aman akses ke database kami?",
        jawab: "Kredensial yang dipakai wajib read-only dan disimpan terenkripsi. Query dibatasi hanya SELECT, dengan LIMIT dan timeout. Setiap query tercatat di audit log, dan kolom sensitif bisa dimasking mengikuti UU PDP No. 27/2022.",
      },
      // [TANYA-OWNER] FAQ "apakah isi baris data dikirim ke penyedia model bahasa?" belum
      // bisa dijawab dari docs. build-plan hanya menyebut NL->SQL memakai skema + knowledge
      // store. Perlu jawaban teknis final dari owner sebelum FAQ ini ditayangkan.
      {
        tanya: "Kalau jawabannya salah, bagaimana?",
        jawab: "Jawaban keliru hampir selalu berasal dari makna data yang belum terpetakan. Definisi tabel, kolom, relasi, dan metrik disimpan berversi, jadi koreksi bisa dilakukan sekali dan langsung memperbaiki jawaban-jawaban berikutnya.",
      },
      {
        tanya: "Bisa dicoba dulu sebelum berlangganan?",
        jawab: "Bisa lewat sesi demo. Untuk pemakaian dengan data Anda sendiri, kami buka slot pilot berbayar dalam jumlah terbatas supaya setiap pilot benar-benar terdampingi.",
      },
    ],
  },

  penutup: {
    eyebrow: "Langkah berikutnya",
    judul: "Bawa satu pertanyaan yang selama ini susah dijawab.",
    teks: "Sebutkan pertanyaan bisnis yang paling sering Anda ajukan ke staf, dan database apa yang Anda pakai. Dari situ kami bisa langsung menilai apakah ini cocok untuk Anda.",
    primer: {
      label: "Diskusi via WhatsApp",
      pesan: "Halo BCT, saya ingin tahu apakah dashboard tanya-data cocok untuk database bisnis saya.",
    },
    sekunder: {
      label: "Bandingkan semua harga",
      href: "/pricing",
    },
  },
};
