import type { BlokCta, HeroCopy, KepalaSection, MetaCopy } from "./types";

/**
 * Copy halaman /privasi (G-48, permintaan owner Q11).
 *
 * ATURAN ISI: hanya fakta yang benar untuk situs ini hari ini — tidak ada klaim karangan.
 * Sumbernya:
 * - Form kontak: `kontak.form.catatanPrivasi` (content/copy/kontak.ts), SECURITY.md butir 2,
 *   app/api/lead/route.ts (email SMTP ke kotak surat BCT + webhook opsional, tanpa database;
 *   IP hanya untuk anggaran kirim di memori, G-42).
 * - Turnstile: `kontak.form.catatanPemeriksaan` (G-46) — ditulis "bila aktif" karena env-nya
 *   opsional dan production saat ini mematikannya.
 * - Analitik: draf infra plan 11 yang disetujui owner (GATE 1, 2026-09-27), substansi verbatim;
 *   hanya format yang disesuaikan dengan komponen halaman.
 *
 * ALAMAT EMAIL TIDAK DITULIS DI SINI. Owner mengizinkan info@ terbit di /privasi (2026-09-27,
 * G-49): nilainya `site.emailPublik` (content/site.ts), dirender HalamanPrivasi di antara
 * `kalimatEmail.sebelum` dan `.sesudah`. Di halaman lain tetap dilarang (check-pii).
 */

export type BagianPrivasi = {
  /** Dipakai sebagai id heading (`judul-<id>`) dan key React. */
  id: string;
  kepala: KepalaSection;
  paragraf: string[];
  /** Butir bertanda, dirender setelah `paragraf`. */
  daftar?: string[];
  /** Paragraf setelah `daftar`. */
  paragrafAkhir?: string[];
  /** Kalimat penutup berisi alamat email publik (`site.emailPublik`, hanya di /privasi — G-49). */
  kalimatEmail?: { sebelum: string; sesudah: string };
};

export type PrivasiCopy = {
  meta: MetaCopy;
  hero: HeroCopy;
  diperbarui: {
    label: string;
    /** Tanggal tampil. */
    tanggal: string;
    /** Nilai `dateTime` untuk <time>. */
    iso: string;
  };
  bagian: BagianPrivasi[];
  /**
   * Atribusi data GeoLite2 (MaxMind) yang mungkin diwajibkan lisensinya bila Umami memakai
   * basis data itu untuk memperkirakan negara asal. [TANYA-OWNER] MENUNGGU INFRA memastikan
   * (plan 11). Untuk menyalakan: `tampil: true` — satu baris, teksnya sudah siap.
   */
  atribusiGeoLite2: { tampil: boolean; teks: string };
  /** Pertanyaan soal data: form /kontak + WhatsApp (bukan alamat email — lihat kepala berkas). */
  kontak: BlokCta;
};

export const privasi: PrivasiCopy = {
  meta: {
    title: "Kebijakan privasi",
    description:
      "Data apa yang dikumpulkan situs BCT dan untuk apa: form kontak, pemeriksaan anti-spam, dan analitik Umami tanpa cookie yang kami jalankan sendiri.",
  },

  hero: {
    eyebrow: "Kebijakan privasi",
    judul: "Data seperlunya, untuk alasan yang jelas.",
    teks: "Situs ini hanya mengumpulkan data di dua tempat: form kontak dan analitik kunjungan. Halaman ini menjelaskan apa yang dikumpulkan, untuk apa, dan ke mana perginya.",
    primer: {
      label: "Tanya lewat WhatsApp",
      pesan: "Halo BCT, saya ingin bertanya soal data pribadi saya di situs Anda.",
    },
    sekunder: {
      label: "Buka form kontak",
      href: "/kontak",
    },
  },

  diperbarui: {
    label: "Terakhir diperbarui",
    tanggal: "27 September 2026",
    iso: "2026-09-27",
  },

  bagian: [
    {
      id: "form-kontak",
      kepala: {
        eyebrow: "Form kontak",
        judul: "Yang Anda kirim lewat form",
      },
      paragraf: [
        "Form di halaman kontak meminta nama, nomor WhatsApp atau alamat email, topik yang ingin dibahas (boleh dilewati), dan pesan Anda. Data itu hanya dipakai untuk membalas pertanyaan Anda.",
        "Setelah dikirim, pesan diteruskan sebagai email ke kotak surat BCT. Bila jalur tambahan kami aktifkan, salinan yang sama juga diteruskan lewat webhook. Situs ini tidak menyimpan kiriman Anda di database, dan tidak membagikannya ke pihak lain untuk keperluan pemasaran, sejalan dengan UU PDP No. 27/2022.",
        "Untuk menangkal spam, alamat IP pengirim dipakai untuk membatasi jumlah kiriman. Hitungan itu hanya ada di memori server, berlaku paling lama 24 jam, dan tidak disimpan di database.",
      ],
    },
    {
      id: "pemeriksaan-spam",
      kepala: {
        eyebrow: "Pemeriksaan anti-spam",
        judul: "Cloudflare Turnstile, bila aktif",
      },
      paragraf: [
        "Bila kami mengaktifkannya, form kontak dilindungi Cloudflare Turnstile untuk menangkal spam. Untuk pemeriksaan itu, Cloudflare memproses data teknis perangkat Anda (seperti alamat IP dan jenis peramban) sesuai kebijakan privasinya; isi pesan Anda tidak dikirim ke Cloudflare.",
        "Pemeriksaan ini hanya berjalan di form kontak. Saat aktif, form menampilkan catatannya sendiri tepat di atas tombol kirim.",
      ],
    },
    {
      id: "analitik",
      kepala: {
        eyebrow: "Analitik situs",
        judul: "Statistik kunjungan tanpa cookie",
      },
      paragraf: [
        "Kami menggunakan Umami, alat analitik sumber terbuka yang kami jalankan sendiri di server kami (analytics.bimacreative.tech), untuk memahami cara situs ini digunakan — misalnya halaman yang paling sering dikunjungi, perangkat dan peramban yang dipakai, serta negara asal kunjungan secara umum.",
      ],
      daftar: [
        "Umami tidak memakai cookie dan tidak membuat profil pengunjung.",
        "Alamat IP tidak disimpan; IP hanya dipakai sesaat untuk memperkirakan negara asal lalu dibuang.",
        "Parameter pada alamat halaman (query string) tidak dikirim.",
        "Jika peramban Anda mengaktifkan Do Not Track, kunjungan Anda tidak dicatat.",
        "Data tidak dibagikan atau dijual kepada pihak ketiga dan tidak dipakai untuk iklan.",
        "Data statistik disimpan paling lama 25 bulan, lalu dihapus.",
      ],
      paragrafAkhir: [
        "Pengolahan ini didasarkan pada kepentingan yang sah untuk memelihara dan meningkatkan layanan situs, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.",
      ],
      kalimatEmail: {
        sebelum: "Pertanyaan terkait data dapat dikirim ke",
        sesudah: ", lewat form di halaman kontak, atau WhatsApp.",
      },
    },
  ],

  atribusiGeoLite2: {
    // Wajib (GeoLite EULA §3, diperbarui 2026-02-12; dicek infra 2026-09-27).
    tampil: true,
    teks: "Perkiraan negara asal kunjungan memakai data GeoLite yang dibuat oleh MaxMind, tersedia di https://www.maxmind.com.",
  },

  kontak: {
    eyebrow: "Pertanyaan soal data",
    judul: "Ada yang ingin ditanyakan tentang data Anda?",
    teks: "Kirim pertanyaan lewat form di halaman kontak, atau langsung lewat WhatsApp. Sebutkan bahwa pertanyaannya soal data pribadi supaya kami bisa menjawab dengan tepat.",
    primer: {
      label: "Tanya lewat WhatsApp",
      pesan: "Halo BCT, saya ingin bertanya soal data pribadi saya di situs Anda.",
    },
    sekunder: {
      label: "Buka form kontak",
      href: "/kontak",
    },
  },
};
