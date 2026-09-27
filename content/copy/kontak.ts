import type { BlokCta, HeroCopy, KepalaSection, MetaCopy } from "./types";

/**
 * KERANGKA halaman /kontak. Copy sudah final dan siap tayang.
 *
 * PERINGATAN UNTUK FRONTEND-BUILDER:
 * - Nomor WhatsApp, email, dan lokasi TIDAK ada di file ini. Ambil dari `site` di
 *   content/site.ts (`site.whatsappNumber` lewat `waLink()`, `site.email`, `site.location`).
 *   Field `nilaiDari` di bawah menyebut key mana yang harus dipakai. Khusus form
 *   (client component) DILARANG mengimpor content/site.ts: tombol WhatsApp-nya
 *   dirender di server oleh <HalamanKontak> lalu dioper sebagai prop `tombolWa` —
 *   aturan 7 di components/sections/form-kontak.tsx.
 * - Nama field form di bawah SUDAH DISAMAKAN dengan skema zod di app/api/lead/route.ts:
 *   nama, kontak, pesan, produk ("bima-insight" | "odoo" | "web-apps" | "lainnya"),
 *   dan honeypot "website". Jangan mengganti nama field tanpa mengubah route-nya.
 * - Field jebakan bot wajib tersembunyi dari pengguna dan dari pembaca layar
 *   (mis. `aria-hidden` + `tabIndex={-1}` + tidak terlihat lewat kelas DAN `style`
 *   inline), tapi TETAP punya label untuk bot. Teks label ada di `form.situs` —
 *   nama kunci itu sengaja netral, alasannya di catatan pada tipenya.
 * - Hanya `produk` yang boleh dikosongkan. `nama`, `kontak`, dan `pesan` wajib.
 * - Pesan galat di browser ada di `form.validasiLokal` — pakai itu, jangan biarkan
 *   browser memunculkan pesan bawaannya (bahasanya ikut setelan perangkat).
 * - `form.tanpaJs` WAJIB dirender di dalam `<noscript>` tepat di atas tombol kirim.
 *   Tanpa itu, pengunjung tanpa JavaScript menghadapi tombol mati yang terlihat
 *   normal dan tidak pernah tahu sebabnya. Syaratnya ada di catatan tipe.
 * - ANGKA BATAS PANJANG TIDAK ADA DI FILE INI dan tidak boleh ditambahkan. Sumbernya
 *   konstanta `BATAS_ISIAN` di app/api/lead/batas.ts — berkas daun yang dipakai
 *   bersama oleh skema zod app/api/lead/route.ts dan sisi klien. Impor dari sana
 *   untuk `minLength` dan untuk pemeriksaan panjang di browser; token `{maks}`
 *   diisi di sisi server oleh <HalamanKontak>, bukan di dalam form.
 * - JANGAN memasang `maxLength` pada isian mana pun. Browser memotong tempelan yang
 *   melewatinya tanpa memberi tahu siapa pun, dan itu membuat ketiga pesan
 *   `terlaluPanjang` di bawah mustahil muncul — padahal ketiganya ditulis justru
 *   untuk kejadian tempel. Aturan 8 di components/sections/form-kontak.tsx.
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

/**
 * Pesan untuk satu isian teks saat pemeriksaan di browser menolak isinya.
 *
 * Panjang diperiksa setelah spasi di ujung dibuang — sama seperti `.trim()` pada
 * skema di route, supaya isian berisi spasi saja tidak lolos di browser lalu
 * ditolak server.
 */
export type ValidasiTeks = {
  /** Isian wajib yang dibiarkan kosong. */
  kosong: string;
  /** Terisi, tapi belum mencapai panjang minimum skema. */
  terlaluPendek: string;
  /** Melewati panjang maksimum skema. */
  terlaluPanjang: string;
};

export type FormKontakCopy = {
  kepala: KepalaSection;
  nama: { label: string; placeholder: string };
  kontak: { label: string; bantuan: string; placeholder: string };
  produk: { label: string; bantuan: string; opsi: OpsiProduk[] };
  pesan: { label: string; bantuan: string; placeholder: string };
  /**
   * Label isian jebakan bot (field `website` di form dan di skema route).
   *
   * NAMA KUNCINYA WAJIB NETRAL, dan itu bukan soal gaya. Seluruh objek `form` ini
   * dioper ke client component, dan React menyerialkan prop client component ke
   * muatan RSC yang menempel di HTML halaman — nama kunci ikut terbaca siapa pun
   * yang membuka "view source". Kunci ini dulu bernama `honeypot`, sehingga HTML
   * `/kontak` memuat `"honeypot":{"label":"Website"}` dan bot cukup mencari string
   * itu untuk tahu isian mana yang harus dibiarkan kosong (G-19b, security-auditor
   * 2026-08-25). Jangan mengembalikan nama yang menyebut fungsinya.
   */
  situs: { label: string };
  /**
   * Penanda untuk isian yang boleh dilewati. HANYA `produk` yang opsional —
   * `.optional()` di skema route; nama, kontak, dan pesan tidak punya penanda
   * karena semuanya wajib. Jangan menambahkan penanda "wajib" ke tiga isian itu:
   * kalau hanya satu isian yang boleh kosong, menandai yang opsional lebih
   * ringkas dan tidak membuat form terasa seperti formulir birokrasi.
   *
   * Tidak perlu ditampilkan bila form memilih memasang "Belum tahu, mau diskusi
   * dulu" sebagai pilihan awal — pengunjung tidak pernah dihadapkan pada isian
   * kosong, jadi tidak ada yang perlu ditandai.
   */
  penandaOpsional: string;
  /**
   * Pemeriksaan di browser, sebelum apa pun dikirim ke server.
   *
   * WAJIB dipakai menggantikan pesan bawaan browser (mis. `noValidate` pada
   * <form> lalu render sendiri, atau `setCustomValidity()`): pesan bawaan
   * mengikuti bahasa perangkat pengunjung, dan situs ini seluruhnya Bahasa
   * Indonesia.
   *
   * BATASNYA BUKAN DI SINI. Kalimat di bawah tidak memuat angka; satu-satunya
   * token yang boleh diganti angka adalah `{maks}` (lihat catatan di nilainya).
   * Angka batas hidup di konstanta `BATAS_ISIAN` (app/api/lead/batas.ts), yang
   * dipakai skema zod route DAN sisi klien. Pemeriksaan panjang di browser,
   * `minLength`, dan pengisian `{maks}` semuanya mengambil dari konstanta itu —
   * jangan mengetik ulang angkanya di komponen dan jangan menaruhnya di file ini.
   *
   * `maxLength` SENGAJA tidak dipasang. Kalau isian dipagari `maxLength`, browser
   * memotong tempelan yang melewatinya secara senyap dan pesan `terlaluPanjang`
   * tidak pernah bisa muncul. Batas atas ditegakkan di dua tempat yang memang
   * memberi tahu pengunjung: pemeriksaan di browser dan skema zod (422 →
   * `gagalValidasi`). Lihat aturan 8 di components/sections/form-kontak.tsx.
   *
   * Honeypot sengaja tidak punya pesan: isinya tidak pernah boleh diadukan ke
   * siapa pun. Bot tidak membaca pesan galat, dan pengunjung tidak melihat
   * isiannya.
   */
  validasiLokal: {
    /** Ringkasan di atas form saat pengiriman ditahan. Jadikan target fokus. */
    ringkasan: string;
    nama: ValidasiTeks;
    kontak: ValidasiTeks;
    pesan: ValidasiTeks;
    /**
     * `produk` opsional dan pilihannya sudah dibatasi daftar `opsi`, jadi tidak
     * ada "kosong" maupun "terlalu pendek". Satu pesan ini hanya jaring pengaman
     * bila nilainya sempat di luar daftar (mis. isian lama tersimpan browser).
     */
    produk: { tidakDikenali: string };
  };
  /**
   * Satu-satunya kalimat di halaman ini yang dirender DI DALAM `<noscript>`,
   * tepat di atas tombol kirim. Hanya terlihat oleh pengunjung yang JavaScript-nya
   * mati.
   *
   * Kenapa ada: tombol kirim mati sampai form terhidrasi (aturan 5 di
   * components/sections/form-kontak.tsx) — penjagaan terhadap pengiriman bawaan
   * browser yang membocorkan nama, kontak, dan seluruh isi pesan ke query string.
   * Efek sampingnya, bila JavaScript dimatikan penuh tombol itu mati SELAMANYA
   * sambil tetap terlihat normal: ditekan, tidak terjadi apa-apa, tanpa satu pun
   * penjelasan. Kalimat ini yang menjelaskan.
   *
   * ATURAN PEMAKAIAN:
   * - WAJIB di dalam `<noscript>`. Jangan pernah dipasang lewat state hidrasi
   *   (`!siap`): jendela pra-hidrasi dilewati SETIAP pengunjung pada setiap
   *   pemuatan, jadi pesan ini akan berkedip di form yang sebenarnya sehat dan
   *   mengaku JavaScript mati kepada orang yang JavaScript-nya hidup.
   * - BUKAN pengganti `gagalBelumSiap` dan sebaliknya. `gagalBelumSiap` bicara
   *   soal tujuan lead yang belum tersambung (balasan 503) — kondisi yang hanya
   *   bisa muncul kalau JavaScript hidup dan kiriman benar-benar berangkat.
   *   Menukar keduanya = memberi pengunjung sebab yang salah.
   * - Kalimat ini berdiri sendiri: seluruh CTA WhatsApp di halaman (hero, jalur
   *   kontak, penutup, tombol mengambang) adalah tautan biasa yang tetap jalan
   *   tanpa JavaScript. Kalau ingin menaruh tombol langsung di dalam `<noscript>`,
   *   pakai ulang prop `tombolWa` yang sudah dipakai kotak hasil — jangan membuat
   *   label baru, dan jangan menulis nomor WhatsApp di sini.
   * - SENGAJA tidak menyuruh pengunjung menyalakan JavaScript. Sebagian
   *   mematikannya dengan sengaja, dan menyuruh orang mengubah setelan peramban
   *   demi mengisi form kami adalah permintaan yang tidak sepadan — sementara
   *   jalur WhatsApp sudah terbuka dan sama-sama sampai.
   */
  tanpaJs: string;
  tombolKirim: string;
  tombolMengirim: string;
  /**
   * Pesan hasil kiriman. Pemetaan ke balasan app/api/lead/route.ts — pakai persis
   * ini, jangan menggabung 503 ke `gagal`:
   *
   * | Balasan                                   | Pesan            |
   * |-------------------------------------------|------------------|
   * | 200 { ok: true }                          | `sukses`         |
   * | 422 (validasi zod)                        | `gagalValidasi`  |
   * | 413 (pesan terlalu besar)                 | `gagalValidasi`  |
   * | 429 (rate limit, ada header Retry-After)  | `gagalRateLimit` |
   * | 503 (tanpa kanal / anggaran kirim habis)  | `gagalBelumSiap` |
   * | 400, 502, status lain, gagal jaringan     | `gagal`          |
   */
  sukses: string;
  gagal: string;
  gagalRateLimit: string;
  gagalValidasi: string;
  gagalBelumSiap: string;
  /**
   * Pemeriksaan otomatis Cloudflare Turnstile (G-43) — hanya dipakai bila widget aktif.
   * `menunggu`: kirim ditekan sebelum pemeriksaan memberi token (widget belum siap, atau
   * pengunjung belum menyelesaikan tantangan interaktif). Kiriman TIDAK berangkat; isian utuh.
   * Kunci `pemeriksaan` sengaja netral (aturan 9 di components/sections/form-kontak.tsx).
   */
  pemeriksaan: { menunggu: string };
  catatanPrivasi: string;
  /** Tampil hanya bila Turnstile aktif (G-46). */
  catatanPemeriksaan: string;
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
      // Isian ini boleh dilewati (`produk` .optional() di route, dan route mengisi
      // "lainnya" bila kosong). Kalimat lama berbunyi "Pilih yang paling
      // mendekati" — terbaca sebagai perintah, seolah wajib. Diganti agar
      // pengunjung yang belum punya gambaran tidak merasa tertahan di sini.
      bantuan: "Boleh dilewati. Kalau sudah ada gambaran, memilih satu membantu kami menyiapkan jawaban yang lebih siap.",
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
    situs: {
      // Field jebakan bot. Wajib disembunyikan dari pengguna dan pembaca layar —
      // lewat kelas DAN `style` inline, supaya tetap tersembunyi bila CSS gagal
      // dimuat. Kunci `situs` sengaja netral: lihat catatan pada tipenya.
      label: "Website",
    },
    penandaOpsional: "opsional",
    validasiLokal: {
      ringkasan: "Pesan belum terkirim — ada isian yang perlu dilengkapi dulu. Kami tandai di bawah.",
      nama: {
        kosong: "Kami belum tahu harus menyapa Anda dengan nama apa. Nama panggilan sudah cukup.",
        // Batas minimumnya sangat rendah, jadi yang terjadi di sini praktis
        // hanya salah ketik satu huruf. Menyebut angkanya tidak menolong.
        terlaluPendek: "Sepertinya nama Anda belum selesai diketik. Coba lengkapi sedikit.",
        // Isian ini sengaja tanpa `maxLength` (aturan 8 di form-kontak.tsx), jadi
        // teks sepanjang apa pun tetap masuk dan pesan ini benar-benar muncul —
        // paling sering saat teks ditempel. Angkanya tidak relevan bagi
        // pengunjung — yang dia butuhkan adalah tahu harus menulis apa.
        terlaluPanjang: "Isian ini kepanjangan untuk sebuah nama. Cukup nama yang biasa Anda pakai.",
      },
      kontak: {
        kosong: "Kami belum punya jalur untuk membalas. Tulis nomor WhatsApp atau alamat email Anda.",
        terlaluPendek: "Nomor atau alamat email ini sepertinya belum lengkap. Coba periksa lagi.",
        terlaluPanjang: "Isian ini kepanjangan. Cukup satu nomor WhatsApp atau satu alamat email — yang paling sering Anda buka.",
      },
      pesan: {
        kosong: "Ceritanya masih kosong. Satu-dua kalimat tentang kebutuhan Anda sudah cukup untuk mulai.",
        // SENGAJA tanpa "minimal N karakter". Batas di skema adalah pagar
        // terhadap isian asal-asalan, bukan ukuran cerita yang berguna;
        // menyebut angkanya justru mengundang jawaban sependek angka itu, yang
        // lolos kirim tapi tidak bisa kami jawab. Jadi yang diminta di sini isi,
        // bukan panjang.
        terlaluPendek: "Ceritanya masih terlalu singkat untuk kami pahami. Tambahkan bidang usaha Anda dan satu bagian yang paling sering bermasalah.",
        // SATU-SATUNYA kalimat yang memuat angka, lewat token {maks} yang WAJIB
        // diganti `BATAS_ISIAN.pesan.maks` (app/api/lead/batas.ts) di sisi server,
        // sebelum copy menyeberang ke form. Di sini angkanya benar-benar menolong:
        // pengunjung sudah menulis panjang dan perlu tahu seberapa banyak yang
        // harus dipotong. Jangan pernah menulis angkanya di file ini.
        terlaluPanjang: "Cerita Anda melebihi ruang yang tersedia di kolom ini (maksimal {maks} karakter). Kirim ringkasannya saja — sisanya bisa kita bahas di WhatsApp tanpa batas panjang.",
      },
      produk: {
        tidakDikenali: "Pilihan itu sudah tidak tersedia. Pilih ulang dari daftar, atau lewati saja.",
      },
    },
    // Dirender di dalam <noscript> di atas tombol kirim (lihat catatan pada tipe).
    // Kalimat pertama menyebut sebabnya sekaligus akibatnya, supaya tombol yang
    // terlihat normal itu tidak sempat ditekan sia-sia. Kalimat kedua memberi
    // jalan yang benar-benar terbuka detik itu juga. Tanpa menyalahkan, tanpa
    // menuntut ubah setelan, dan tanpa istilah teknis selain "JavaScript".
    tanpaJs: "Form ini butuh JavaScript untuk mengirim, dan di peramban Anda JavaScript sedang tidak aktif — tombol kirim di bawah tidak akan bekerja walau tampilannya biasa saja. Tombol WhatsApp di halaman ini tetap berjalan tanpa JavaScript: ceritakan kebutuhan Anda di sana, dan pesannya sampai ke orang yang sama.",
    tombolKirim: "Kirim pesan",
    tombolMengirim: "Mengirim…",
    sukses: "Pesan Anda terkirim. Kami balas lewat kontak yang Anda tulis. Kalau mendesak, silakan lanjut lewat WhatsApp.",
    // Gangguan yang benar-benar sementara (webhook menolak atau lewat batas waktu,
    // body rusak, koneksi pengunjung putus). Di sini "coba lagi" memang masuk akal.
    gagal: "Pesan gagal terkirim. Isian Anda tidak bermasalah — kemungkinan gangguan koneksi sesaat. Coba kirim lagi, atau langsung lewat WhatsApp.",
    // Jatahnya per jaringan (bukan per perangkat) dan jendelanya 60 detik, jadi
    // pengunjung di kantor yang sama bisa kena tanpa merasa mencoba berkali-kali.
    // "Sekitar satu menit" = batas atas header Retry-After dari route.
    gagalRateLimit: "Terlalu banyak percobaan dari jaringan ini. Tunggu sekitar satu menit sebelum mengirim lagi, atau langsung hubungi kami lewat WhatsApp.",
    // Jaring pengaman: kalau `validasiLokal` bekerja, pengunjung nyaris tidak
    // pernah sampai ke sini. Yang tersisa adalah isian yang lolos pemeriksaan
    // browser tapi ditolak skema (mis. teks tak terlihat yang dibersihkan server
    // sampai isinya menyusut) dan body kelewat besar. Karena itu kalimatnya harus
    // menutup "kurang" sekaligus "kelewat panjang", bukan hanya "belum lengkap".
    gagalValidasi: "Ada isian yang belum lengkap atau terlalu panjang. Periksa kembali nama, kontak, dan pesan Anda.",
    // Tujuan lead belum tersambung (LEAD_WEBHOOK_URL kosong). Ini kondisi yang
    // PALING mungkin muncul lebih dulu, dan sifatnya tidak akan hilang sendiri —
    // karena itu dilarang memakai kalimat "coba lagi nanti". Pengunjung harus
    // pindah jalur, bukan mengulang jalur yang sama.
    // Catatan untuk frontend-builder: pada kondisi ini isi form JANGAN dikosongkan
    // supaya pengunjung masih bisa menyalin pesannya ke WhatsApp.
    gagalBelumSiap: "Pengiriman lewat form sedang tidak aktif, jadi pesan Anda tidak sampai ke kami. Mengirim ulang tidak akan mengubahnya. Silakan salin pesan Anda ke WhatsApp — jalur itu pasti sampai dan kami balas dari sana.",
    // G-43: dipakai juga saat anggaran kirim situs habis (G-42) — balasannya sama-sama 503,
    // dan kalimat `gagalBelumSiap` di atas tetap jujur untuk keadaan itu.
    pemeriksaan: {
      menunggu: "Pemeriksaan keamanan otomatis belum selesai, jadi pesan Anda belum dikirim. Tunggu beberapa detik lalu tekan kirim lagi — isian Anda tetap di tempatnya. Kalau tidak kunjung bisa, langsung hubungi kami lewat WhatsApp.",
    },
    // Dasar kalimat ini: app/api/lead/route.ts tidak menyimpan data (hanya meneruskan ke
    // LEAD_WEBHOOK_URL) dan SECURITY.md butir 2 (data lead minimal, selaras UU PDP).
    // [TANYA-OWNER] Konfirmasi tujuan LEAD_WEBHOOK_URL nanti bukan tool marketing pihak
    // ketiga — kalau ternyata iya, kalimat privasi ini WAJIB diubah agar tetap jujur.
    catatanPrivasi:
      "Data yang Anda kirim hanya dipakai untuk membalas pertanyaan ini. Kami tidak menyimpannya di database situs dan tidak membagikannya ke pihak lain untuk keperluan pemasaran, sejalan dengan UU PDP No. 27/2022.",
    // G-46: hanya tampil bila Turnstile aktif — Cloudflare ikut memproses data teknis
    // perangkat pengunjung, jadi kalimat privasi di atas saja tidak lagi lengkap.
    catatanPemeriksaan:
      "Form ini dilindungi Cloudflare Turnstile untuk menangkal spam. Untuk pemeriksaan itu, Cloudflare memproses data teknis perangkat Anda (seperti alamat IP dan jenis peramban) sesuai kebijakan privasinya; isi pesan Anda tidak dikirim ke Cloudflare.",
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
