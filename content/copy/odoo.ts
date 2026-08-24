import type { ProdukCopy } from "./types";

/**
 * Copy halaman /produk/odoo.
 *
 * Nama paket ("Implementasi UMKM", "Odoo Care") dan angka harga TIDAK ditulis di sini —
 * dirender dari `produk[]` di content/site.ts. Body copy menyebut layanannya secara
 * deskriptif ("perawatan bulanan") agar tidak menduplikasi nama paket.
 *
 * Sumber fakta: content/site.ts (Odoo Community, modul standar, CoA Indonesia + PPN,
 * migrasi data awal, pelatihan, hosting terkelola, backup harian, patch, jam support,
 * laporan kesehatan), docs/flight-plan.md (mesin kas + recurring, scope tetap, DP 50%,
 * kontrak recurring min. 6 bulan, ceruk retail + kepatuhan lokal), docs/build-plan.md
 * (frontend Next.js metadata-driven, jalur "Implementasi Odoo Premium" single-tenant).
 */

export const odoo: ProdukCopy = {
  slug: "odoo",

  meta: {
    title: "Implementasi Odoo & perawatan",
    description:
      "Implementasi Odoo Community dengan scope dan timeline tetap: penjualan, stok, akuntansi CoA Indonesia dan PPN. Plus perawatan bulanan setelah go-live.",
  },

  hero: {
    eyebrow: "Produk · ERP",
    judul: "ERP yang benar-benar dipakai staf Anda.",
    teks: "Implementasi Odoo Community dengan scope dan timeline yang dikunci sejak penawaran: penjualan, pembelian, stok, dan akuntansi dengan chart of account Indonesia serta PPN. Setelah go-live, sistemnya tetap kami rawat — bukan ditinggal.",
    primer: {
      label: "Konsultasi via WhatsApp",
      pesan: "Halo BCT, saya ingin konsultasi implementasi Odoo untuk bisnis saya.",
    },
    sekunder: {
      label: "Lihat rate card",
      href: "/pricing",
    },
  },

  masalah: {
    kepala: {
      eyebrow: "Masalah",
      judul: "ERP gagal bukan karena fiturnya kurang.",
      teks: "Empat pola kegagalan yang paling sering terjadi — dan cara kami menghindarinya.",
    },
    poin: [
      {
        judul: "Data operasional tercecer",
        teks: "Stok di spreadsheet, penjualan di aplikasi kasir, tagihan di buku catatan. Tutup buku bulanan berubah jadi pekerjaan merekonstruksi kejadian.",
      },
      {
        judul: "Proyek molor dan membengkak",
        teks: "Implementasi ERP sering dibuka tanpa batas scope, lalu setiap permintaan baru masuk begitu saja. Kami mengunci scope dan timeline di penawaran; perubahan dihitung terpisah dan disepakati dulu.",
      },
      {
        judul: "Kepatuhan diurus belakangan",
        teks: "Chart of account dan PPN disiapkan sejak awal mengikuti praktik akuntansi Indonesia, bukan ditambal setelah sistem sudah berisi ribuan transaksi.",
      },
      {
        judul: "Setelah go-live, tidak ada yang merawat",
        teks: "Server tidak dipantau, backup tidak pernah diuji, update tertunda berbulan-bulan. Ini pembunuh implementasi yang paling sering dan paling mudah dicegah.",
      },
    ],
  },

  caraKerja: {
    kepala: {
      eyebrow: "Cara kerja",
      judul: "Yang Anda dapat, urut dari awal.",
      teks: "Semua tahap di bawah masuk dalam paket implementasi dengan harga tetap.",
    },
    langkah: [
      {
        nomor: "01",
        judul: "Pemetaan proses",
        teks: "Kami telusuri alur kerja Anda hari ini: siapa mencatat apa, di titik mana informasinya hilang, dan laporan mana yang sebenarnya dipakai untuk mengambil keputusan.",
      },
      {
        nomor: "02",
        judul: "Setup modul standar",
        teks: "Penjualan, pembelian, stok, dan akuntansi disiapkan mengikuti proses yang sudah dipetakan. Kami mengutamakan modul standar — biaya perawatannya jauh lebih murah dalam jangka panjang.",
      },
      {
        nomor: "03",
        judul: "Akuntansi Indonesia",
        teks: "Chart of account disusun mengikuti praktik akuntansi Indonesia, dan PPN disiapkan sejak konfigurasi awal.",
      },
      {
        nomor: "04",
        judul: "Migrasi data awal",
        teks: "Master data — pelanggan, pemasok, produk, dan saldo awal — dipindahkan dan dicocokkan sebelum sistem dinyatakan siap dipakai.",
      },
      {
        nomor: "05",
        judul: "Pelatihan tim",
        teks: "Yang menentukan ERP berhasil bukan daftar fiturnya, tapi apakah staf Anda mau memakainya setiap hari. Pelatihan dilakukan pada proses nyata, bukan data contoh.",
      },
    ],
  },

  tambahan: [
    {
      id: "perawatan",
      kepala: {
        eyebrow: "Setelah go-live",
        judul: "Sistem yang hidup butuh dirawat, bukan hanya dipasang.",
        teks: "Tersedia layanan perawatan bulanan: server dikelola dan dipantau, backup berjalan harian, patch dan update dijadwalkan, dan Anda punya jatah jam support tiap bulan plus laporan kesehatan sistem. Kontrak minimal enam bulan, karena manfaatnya baru terasa setelah beberapa siklus tutup buku.",
      },
    },
    {
      id: "frontend",
      kepala: {
        eyebrow: "Opsional",
        judul: "Tampilan modern di atas Odoo.",
        teks: "Antarmuka bawaan Odoo dirancang untuk pengguna back-office. Kalau sistemnya juga akan dipakai staf lapangan atau pelanggan Anda, tersedia frontend berbasis Next.js di atas data Odoo yang sama — lebih ringan, lebih cepat dipahami orang yang tidak dilatih ERP. Bagian ini dihitung sebagai pekerjaan terpisah dari paket implementasi.",
      },
    },
  ],

  untukSiapa: {
    kepala: {
      eyebrow: "Untuk siapa",
      judul: "Kami tidak mengambil semua proyek ERP.",
    },
    labelCocok: "Cocok kalau",
    cocok: [
      "Bisnis Anda retail atau distribusi dengan stok yang harus dipantau lintas lokasi.",
      "Transaksi sudah rutin dan cukup banyak, tapi pencatatannya masih terpisah-pisah.",
      "Anda butuh pembukuan yang rapi untuk keperluan pajak, audit, atau pengajuan pendanaan.",
      "Ada minimal satu orang di tim Anda yang siap jadi penanggung jawab sistem sehari-hari.",
    ],
    labelBelumCocok: "Belum cocok kalau",
    belumCocok: [
      "Yang dicari adalah implementasi ERP termurah tanpa pendampingan — kami tidak bermain di sana.",
      "Proses bisnisnya belum stabil dan masih berubah tiap bulan; ERP akan mengunci kekacauan itu, bukan merapikannya.",
      "Tidak ada rencana perawatan setelah go-live sama sekali.",
    ],
  },

  paket: {
    eyebrow: "Harga",
    judul: "Implementasi berharga tetap, perawatan bulanan terpisah.",
    teks: "Proyek dimulai dengan DP 50%. Angka di bawah bersifat indikatif; angka final dikunci di penawaran tertulis setelah proses Anda dipetakan.",
  },

  faq: {
    kepala: {
      eyebrow: "Pertanyaan",
      judul: "Yang paling sering ditanyakan.",
    },
    item: [
      {
        tanya: "Odoo versi apa yang dipakai?",
        jawab: "Odoo Community. Lisensi Enterprise tidak diwajibkan, sehingga yang Anda bayar adalah implementasi dan perawatan — bukan biaya lisensi per pengguna per bulan.",
      },
      {
        tanya: "Bagaimana kalau kebutuhan kami di luar modul standar?",
        jawab: "Kebutuhan di luar paket dihitung terpisah sebagai pengembangan tambahan dan disepakati sebelum dikerjakan. Kami akan menawarkan menyesuaikan proses ke modul standar lebih dulu, karena biaya perawatan jangka panjangnya jauh lebih ringan.",
      },
      {
        tanya: "Apakah perawatan bulanan wajib diambil?",
        jawab: "Untuk implementasi, sangat kami sarankan — sistem yang tidak dipantau dan tidak di-backup adalah risiko yang menumpuk diam-diam. Untuk pekerjaan custom development, kontrak perawatan memang kami wajibkan.",
      },
      {
        tanya: "Kenapa harganya berupa rentang?",
        jawab: "Karena scope-nya berbeda-beda: jumlah modul, kerumitan data yang dimigrasikan, dan jumlah pengguna yang dilatih. Angka pastinya muncul di penawaran setelah proses Anda dipetakan.",
      },
      // [TANYA-OWNER] Belum bisa dijawab dari docs, jadi sengaja TIDAK ditulis:
      // 1. Berapa lama durasi implementasi tipikal (mis. "8-12 minggu")?
      // 2. Apakah addon Coretax / e-Faktur (XSD DJP) dan suite UU PDP dari repo
      //    odoo-platform boleh dijual sebagai bagian paket BCT? build-plan risiko 1
      //    menyebut audit IP addon belum selesai — sampai jelas, jangan dipromosikan.
      // 3. Kebijakan kepemilikan & serah terima data bila kerja sama berakhir.
      // 4. Apakah hosting termasuk on-premise di server klien, atau VPS BCT saja?
    ],
  },

  penutup: {
    eyebrow: "Langkah berikutnya",
    judul: "Mulai dari proses yang paling sering bocor.",
    teks: "Ceritakan bagian mana yang paling sering salah catat atau paling lama diselesaikan. Dari situ kami bisa memperkirakan scope dan angkanya tanpa perlu rapat panjang.",
    primer: {
      label: "Diskusi via WhatsApp",
      pesan: "Halo BCT, saya ingin bahas kebutuhan ERP Odoo untuk bisnis saya.",
    },
    sekunder: {
      label: "Lihat studi kasus",
      href: "/studi-kasus",
    },
  },
};
