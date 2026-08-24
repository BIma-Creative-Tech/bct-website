import type { BlokCta, HeroCopy, KepalaSection, MetaCopy } from "./types";

/**
 * KERANGKA halaman /studi-kasus.
 *
 * PERINGATAN UNTUK FRONTEND-BUILDER:
 * Copy intro di file ini sudah final dan boleh langsung dipakai. Isi studi kasusnya
 * BELUM lengkap karena faktanya belum tersedia di docs. Semua field yang faktanya belum
 * ada dibiarkan `undefined` (opsional) — JANGAN diisi teks contoh, dan jangan pernah
 * merender komentar [TANYA-OWNER] ke halaman.
 *
 * Aturan render: setiap field opsional yang `undefined` -> section-nya tidak dirender
 * sama sekali (bukan dirender kosong, bukan dirender "Segera hadir").
 *
 * Sumber fakta yang tersedia sejauh ini:
 * - content/site.ts `bukti[]`: "KOMDIGI — webapp perizinan e-Telekomunikasi";
 *   "Retail — domain expertise dari pengalaman langsung"; "10+ tahun pengalaman IT".
 * - docs/flight-plan.md: 2 case study (KOMDIGI + retail) adalah aset jualan Q1.
 * Selebihnya belum ada dan tidak boleh dikarang.
 */

export type KutipanKlien = {
  teks: string;
  oleh: string;
  jabatan: string;
};

export type StudiKasus = {
  slug: string;
  /** Judul kartu & halaman detail. */
  judul: string;
  /** Nama klien yang boleh ditampilkan publik. */
  klien: string;
  /** Satu kalimat untuk kartu di halaman daftar. */
  ringkas: string;
  /** Peran BCT/Ade di proyek ini. Kosong = belum dikonfirmasi owner. */
  peran?: string;
  /** Periode pengerjaan, mis. "2023–2024". Kosong = belum dikonfirmasi owner. */
  periode?: string;
  /** Sektor/industri klien. */
  sektor?: string;
  tantangan?: string[];
  pendekatan?: string[];
  /** Hasil terukur. HANYA diisi bila angkanya nyata dan disetujui klien. */
  hasil?: string[];
  teknologi?: string[];
  /** HANYA diisi bila ada testimoni tertulis yang benar-benar diberikan klien. */
  kutipan?: KutipanKlien;
};

export type StudiKasusCopy = {
  meta: MetaCopy;
  hero: HeroCopy;
  daftar: {
    kepala: KepalaSection;
    item: StudiKasus[];
  };
  /** Label UI untuk halaman detail. */
  label: {
    peran: string;
    periode: string;
    sektor: string;
    tantangan: string;
    pendekatan: string;
    hasil: string;
    teknologi: string;
    kembali: string;
  };
  penutup: BlokCta;
};

export const studiKasus: StudiKasusCopy = {
  meta: {
    title: "Studi kasus",
    description:
      "Pekerjaan yang bisa kami tunjukkan: aplikasi web perizinan e-Telekomunikasi untuk KOMDIGI, dan pengalaman langsung di operasional retail Indonesia.",
  },

  hero: {
    eyebrow: "Studi kasus",
    judul: "Sedikit, tapi bisa dipertanggungjawabkan.",
    teks: "Kami memilih menampilkan pekerjaan yang benar-benar bisa kami jelaskan detailnya, daripada mendaftar logo yang tidak bisa kami ceritakan isinya. Kalau Anda ingin melihat lebih dalam, minta saja sesi demo.",
    primer: {
      label: "Minta demo via WhatsApp",
      pesan: "Halo BCT, saya ingin lihat demo pekerjaan yang pernah Anda kerjakan.",
    },
    sekunder: {
      label: "Lihat rate card",
      href: "/pricing",
    },
  },

  daftar: {
    kepala: {
      eyebrow: "Pekerjaan",
      judul: "Yang pernah kami kerjakan.",
    },
    item: [
      {
        slug: "komdigi-e-telekomunikasi",
        judul: "Aplikasi web perizinan e-Telekomunikasi",
        klien: "KOMDIGI",
        ringkas:
          "Aplikasi web untuk proses perizinan e-Telekomunikasi di lingkungan instansi pemerintah.",
        // [TANYA-OWNER] Semua field di bawah ini dibiarkan kosong karena faktanya belum ada
        // di docs. Mohon isi (dan konfirmasi izin publikasinya dari pihak klien):
        // 1. Nama klien yang boleh tayang: "KOMDIGI" saja atau nama panjang kementerian?
        // 2. Peran Ade di proyek ini (lead developer / developer / konsultan?).
        // 3. Periode pengerjaan (tahun mulai–selesai).
        // 4. 2–3 tantangan utama proyek ini.
        // 5. 3–4 langkah pendekatan/solusi yang boleh diceritakan publik.
        // 6. Hasil terukur yang boleh dipublikasikan (mis. jumlah permohonan diproses,
        //    waktu proses sebelum vs sesudah). Kosongkan bila tidak ada izin.
        // 7. Stack teknologi yang boleh disebut.
        // 8. Apakah ada izin tertulis untuk menyebut nama instansi di situs komersial?
      },
      // [TANYA-OWNER] Studi kasus kedua (retail) belum bisa ditulis sama sekali.
      // docs hanya menyebut "domain expertise retail dari pengalaman langsung" dan
      // rencana 2 case study di flight-plan Q1. Yang dibutuhkan dari owner:
      // 1. Nama bisnis retail-nya, atau anonim ("distributor FMCG di Jabodetabek")?
      // 2. Masalah operasional yang diselesaikan + apa yang dikerjakan BCT.
      // 3. Hasil yang boleh dipublikasikan.
      // 4. Apakah ini pekerjaan berbayar untuk klien, atau pengalaman internal/keluarga?
      //    Penting supaya framing-nya jujur dan tidak menyesatkan.
      // Sampai jawabannya masuk, halaman ini hanya menampilkan satu studi kasus.
    ],
  },

  label: {
    peran: "Peran",
    periode: "Periode",
    sektor: "Sektor",
    tantangan: "Tantangan",
    pendekatan: "Pendekatan",
    hasil: "Hasil",
    teknologi: "Teknologi",
    kembali: "Kembali ke studi kasus",
  },

  penutup: {
    eyebrow: "Langkah berikutnya",
    judul: "Kasus Anda kemungkinan berbeda. Ceritakan saja.",
    teks: "Tidak ada dua bisnis yang prosesnya persis sama. Sebutkan bagian yang paling sering bermasalah di tempat Anda, dan kami sampaikan apakah itu wilayah yang bisa kami kerjakan.",
    primer: {
      label: "Chat WhatsApp",
      pesan: "Halo BCT, saya ingin cerita soal proses di bisnis saya yang perlu dibenahi.",
    },
    sekunder: {
      label: "Tentang cara kerja kami",
      href: "/tentang",
    },
  },
};
