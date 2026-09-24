import type { KunciBukti } from "../site";
import type { BlokCta, CtaTautan, HeroCopy, KepalaSection, Langkah, MetaCopy } from "./types";

/**
 * Copy Beranda.
 *
 * Kartu produk dirender dari `produk[]` di content/site.ts (nama + ringkas).
 * Angka bukti dirender dari `bukti[]` di content/site.ts; `bukti.detail` di bawah
 * hanya menambahkan kalimat penjelas, dipasangkan lewat `kunci` (lihat di bawah).
 */

/**
 * Kalimat penjelas tiap butir bukti, DIKUNCI ke `bukti[].kunci` di content/site.ts.
 *
 * Bentuknya `Record`, bukan array, dan itu inti perbaikan G-24. Tiga akibatnya:
 * 1. Urutan penulisan di bawah tidak berpengaruh apa pun — urutan tayang datang dari
 *    `bukti[]`, jadi menukar baris di sana tidak bisa memindahkan paragraf ke angka
 *    yang salah (sebelumnya bisa, tanpa satu pun gerbang menyalak).
 * 2. Butir bukti baru tanpa kalimat di sini = `tsc`/`next build` GAGAL (TS2741,
 *    menyebut kunci yang kalimatnya belum ditulis).
 * 3. Kalimat yatim (kuncinya sudah dihapus dari `bukti[]`) = GAGAL juga (TS2353).
 *
 * Union kuncinya TIDAK ditulis tangan di sini; ia diimpor sebagai `KunciBukti` dari
 * content/site.ts (`import type` — terhapus saat kompilasi). Pola yang sama dengan
 * `SlugProduk` di content/copy/types.ts dan `produkCopy` di content/copy/index.ts.
 */
export type BuktiDetail = Record<KunciBukti, string>;

/**
 * Hero beranda = HeroCopy tanpa `sekunder`, diganti `portofolio`.
 *
 * `portofolio.href` adalah tujuan sebenarnya (/studi-kasus). Selama rutenya belum
 * hidup (W2-03, content/rute.ts) tombolnya memakai `hrefSementara` — jangkar ke
 * section rekam jejak di beranda — lalu pindah sendiri begitu rutenya didaftarkan.
 */
export type BerandaHero = Omit<HeroCopy, "sekunder"> & {
  portofolio: CtaTautan & { hrefSementara: string };
  /**
   * Kata di dalam `judul` yang disorot warna aksen + coretan garis bawah (G-29).
   * Harus muncul persis di `judul`; bila tidak ditemukan, judul tampil polos.
   */
  judulSorot: string;
};

export type BerandaCopy = {
  meta: MetaCopy;
  hero: BerandaHero;
  produk: KepalaSection;
  bukti: {
    kepala: KepalaSection;
    detail: BuktiDetail;
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
    eyebrow: "Technology Partner untuk Bisnis yang Ingin Tumbuh Lebih Terukur",
    judul: "Teknologi yang Dibangun untuk Cara Bisnis Anda Bekerja.",
    judulSorot: "tahu",
    teks: "Kami merancang dan membangun ERP, sistem operasional, dashboard data, dan aplikasi web yang disesuaikan dengan kebutuhan bisnis Anda, sehingga data lebih mudah dipahami, proses lebih terstruktur, dan keputusan dapat diambil dengan dasar yang lebih kuat.",
    primer: {
      label: "Hubungi Kami",
      pesan: "Halo BCT, saya ingin konsultasi kebutuhan sistem bisnis saya.",
    },
    portofolio: {
      label: "Lihat Portofolio Kami",
      href: "/studi-kasus",
      hrefSementara: "#rekam-jejak",
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
    detail: {
      pengalaman:
        "Lebih dari sepuluh tahun membangun dan merawat aplikasi enterprise — termasuk bagian yang jarang dibicarakan vendor: menjaga sistem tetap hidup setelah serah terima.",
      // [TANYA-OWNER] Nama resmi instansi yang boleh ditulis di situs publik: "KOMDIGI" saja,
      // atau nama panjang kementerian? Perlu juga: tahun pengerjaan, peran Ade (lead dev/dev),
      // dan apakah nama proyek boleh disebut publik (izin klien).
      komdigi:
        "Aplikasi web perizinan e-Telekomunikasi untuk KOMDIGI — sistem perizinan di lingkungan instansi pemerintah, tempat alur dan aturannya tidak bisa ditawar.",
      retail:
        "Pemahaman operasional retail datang dari pengalaman langsung menanganinya, bukan dari riset pasar. Itu sebabnya ceruk ini yang kami pilih.",
    },
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
