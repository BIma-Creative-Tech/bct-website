"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent, ReactNode } from "react";
import { BATAS_ISIAN } from "@/app/api/lead/batas";
import { fokusRing, kelas, tombolPrimer } from "@/components/styles";
import type { FormKontakCopy } from "@/content/copy";

/**
 * Form lead — SATU-SATUNYA client component di halaman /kontak.
 *
 * Seluruh teks datang dari `copy` (content/copy/kontak.ts) yang dioper server
 * component; berkas ini tidak menyimpan satu kalimat pun. Angka batas panjang
 * datang dari `BATAS_ISIAN` (app/api/lead/batas.ts) — sumber yang sama dengan
 * skema zod di app/api/lead/route.ts, jadi klien dan server tidak bisa melenceng.
 *
 * KONTRAK PROP: `copy` harus sudah melewati `copyFormSiapPakai()` di
 * <HalamanKontak> — di sanalah token `{maks}` pada `validasiLokal` diisi angka.
 * Merender komponen ini dengan `kontak.form` mentah akan menampilkan "{maks}"
 * kepada pengunjung.
 *
 * ATURAN YANG DIJAGA DI SINI:
 * 1. `noValidate` pada <form>: pesan bawaan browser mengikuti bahasa perangkat
 *    pengunjung (sering Inggris) — dilarang muncul di situs yang seluruhnya
 *    Bahasa Indonesia. Penggantinya `copy.validasiLokal`.
 * 2. Panjang diperiksa pada nilai yang sudah di-`trim()`, sama seperti skema di
 *    route (`z.string().trim()`), supaya isian berisi spasi tidak lolos di sini
 *    lalu ditolak 422 di sana.
 * 3. Pemetaan balasan → pesan mengikuti tabel di content/copy/kontak.ts. Balasan
 *    **503** (tujuan lead belum tersambung) TIDAK mengosongkan isian: copy-nya
 *    menyuruh pengunjung menyalin pesannya ke WhatsApp, dan mengosongkan form
 *    akan menghapus tulisan yang baru saja ia susun.
 * 4. Honeypot `website` tidak pernah divalidasi dan tidak pernah diberi pesan —
 *    mengeluhkan isinya sama dengan memberitahu bot mana jebakannya. Kunci copy-nya
 *    bernama `situs`, BUKAN `honeypot`; alasannya aturan 9.
 * 5. TIGA LAPIS supaya isian tidak pernah mendarat di query string. Seluruh
 *    pengiriman yang sah lewat `kirim()` yang memanggil `preventDefault()`; yang
 *    di bawah ini menjaga semua jalur lain:
 *    a. `disabled` pada tombol submit sampai komponen terhidrasi (state `siap`) —
 *       menutup klik DAN Enter di isian teks (pengiriman implisit dibatalkan bila
 *       tombol default form nonaktif). Alasan lengkapnya di `siap`.
 *    b. Listener `submit` fase capture yang `preventDefault()` selama `!siap` atau
 *       selama kiriman lain masih berjalan — menutup `form.requestSubmit()`, yang
 *       MELEWATI `disabled` sepenuhnya. Hanya berlaku setelah JavaScript berkas ini
 *       hidup; sebelum itu tidak ada listener apa pun yang bisa dipasang.
 *    c. `method="post" action="/api/lead"` sebagai penampung terakhir untuk apa pun
 *       yang lolos dari (a) dan (b) — termasuk `form.submit()`, yang menurut
 *       spesifikasi TIDAK memicu event `submit` sama sekali sehingga MUSTAHIL
 *       dicegat listener mana pun (capture maupun bubble). Tanpa `action`, jalur itu
 *       menjadi GET ke halaman ini dengan nama, kontak, dan seluruh isi pesan
 *       menempel di query string — masuk riwayat peramban, log CDN, dan tautan yang
 *       bisa dibagikan. Dengan `action`, isian berpindah ke body POST (tidak pernah
 *       ke URL) dan endpoint membalas 415 karena pengiriman <form> bawaan tidak
 *       pernah mengirim `application/json` (lihat `TIPE_ISI_WAJIB` di
 *       app/api/lead/route.ts). Jadi: nol isian di URL, nol lead palsu di webhook.
 *       Lapis ini TIDAK pernah tersentuh pengunjung biasa — hanya skrip di halaman
 *       (XSS/ekstensi/devtools) yang bisa memanggil `submit()`/`requestSubmit()`.
 * 6. Akibat aturan 5a, dengan JavaScript dimatikan penuh tombol itu mati selamanya
 *    sambil terlihat normal. `copy.tanpaJs` di dalam `<noscript>` tepat di atasnya
 *    yang menjelaskannya — dan HANYA di dalam `<noscript>`, tidak pernah lewat
 *    `!siap`.
 * 7. BATAS KLIEN. Berkas ini DILARANG mengimpor `content/site.ts` atau modul mana
 *    pun yang mengimpornya — termasuk `components/wa-button.tsx`. `"use client"`
 *    di baris 1 menarik SELURUH graf impor berkas ini ke bundel browser, dan
 *    `site` ikut sebagai objek utuh: `email` (alamat pribadi owner yang dilarang
 *    terbit oleh ADR 2026-08-24), `domain`, `location`, `tagline`. Bukan hanya di
 *    /kontak — modulnya mendarat di chunk bersama yang dimuat SETIAP rute. Terukur
 *    saat regresi ini terjadi: chunk bersama 32.810 → 33.695 B, dan
 *    `grep -rlF "<alamat email owner>" .next/static/` menemukan berkas
 *    (alamatnya sengaja tidak diketik di sini — ADR 2026-08-24 menaruhnya HANYA
 *    di content/site.ts; repo ini publik dan terindeks code search).
 *    Karena itu tombol WhatsApp masuk lewat prop `tombolWa`: <HalamanKontak>
 *    merender <WaButton> di server lalu mengoper HASILNYA. Komponen server yang
 *    dioper sebagai prop tidak ikut masuk graf modul klien (docs Next.js,
 *    "Server and Client Components" § batas `"use client"`), jadi `waLink()` tetap
 *    satu-satunya tempat nomor WA hidup dan nol byte content/site.ts sampai ke
 *    browser. JANGAN menambalnya dengan menaruh `"use client"` di wa-button.tsx:
 *    itu justru memindahkan semua pemakainya (hero, paket, penutup, jalur kontak,
 *    nav, footer, 404, beranda) ke sisi klien sekaligus.
 * 8. TIDAK ADA `maxLength` pada isian teks mana pun. Browser memotong tempelan yang
 *    melewati `maxLength` TANPA memberi tahu siapa pun: menempel 150 karakter ke
 *    isian ber-`maxLength` 100 menyisakan 100 karakter dan nol pesan, sehingga
 *    `validasiLokal.*.terlaluPanjang` mustahil muncul — padahal ketiga kalimatnya
 *    ditulis content-writer justru untuk kejadian itu. Sebelumnya `nama` dan
 *    `kontak` dipagari `maxLength` sementara `pesan` tidak, tanpa alasan tertulis;
 *    sekarang ketiganya diperlakukan sama. Batas atas tetap ditegakkan penuh di dua
 *    tempat yang memang memberi tahu: `periksaTeks` di berkas ini dan skema zod di
 *    app/api/lead/route.ts (422 → `gagalValidasi`). `minLength` tetap dipasang —
 *    ia tidak memotong apa pun, dan dengan `noValidate` ia hanya menandai kontrol
 *    sebagai `:invalid` tanpa memunculkan pesan bawaan browser.
 * 9. NAMA KUNCI `copy` IKUT TERBIT KE HTML. Seluruh objek `copy` dioper dari server
 *    component ke berkas ini, dan React menyerialkan prop client component ke muatan
 *    RSC yang menempel di HTML halaman. Jadi bukan hanya kalimatnya yang terbaca
 *    siapa pun — nama kuncinya juga. Dulu kunci jebakan bernama `honeypot`, sehingga
 *    HTML `/kontak` memuat `"honeypot":{"label":"Website"}` dan bot cukup mencari
 *    string itu lalu membiarkan `name="website"` kosong (G-19b). Sekarang kuncinya
 *    `situs` — netral, tidak membedakan diri dari kunci isian lain. JANGAN
 *    mengembalikannya ke nama yang menyebut fungsinya, dan berlaku sama untuk kunci
 *    baru mana pun yang menyentuh anti-bot.
 * 10. `sejakDibuka` dikirim bersama isian: berapa milidetik halaman sudah terbuka
 *    saat kirim ditekan (`performance.now()`, jam monoton yang tidak terpengaruh
 *    perubahan jam sistem). Server menolak kiriman yang lebih cepat dari ambangnya
 *    (`AMBANG_ISI_MS` di app/api/lead/route.ts). Angkanya sengaja TIDAK diduplikasi
 *    di sini: berkas ini hanya melapor, tidak ikut memutuskan — kalau form ikut
 *    menahan kiriman, dua salinan ambang bisa melenceng dan pengunjung ditolak diam-
 *    diam di sisi yang tidak punya pesan galat.
 * 11. Penyembunyian jebakan diduplikasi ke atribut `style` inline, bukan hanya kelas
 *    Tailwind. Kalau stylesheet gagal dimuat, isian berlabel "Website" muncul
 *    sebagai isian sungguhan (terukur auditor: tinggi 21 px), dan pengunjung yang
 *    mengisinya dapat balasan "Pesan Anda terkirim" padahal leadnya dibuang di
 *    server. Inline style ikut berlaku tanpa satu berkas CSS pun (G-21c).
 *
 * SATU RISIKO YANG SENGAJA DITERIMA, BUKAN TERLUPAKAN (G-21b):
 * pengunjung dengan JavaScript AKTIF tapi chunk berkas ini gagal dimuat permanen
 * (mis. 404 setelah deploy) melihat tombol mati tanpa penjelasan — `<noscript>`
 * menurut definisi tidak menjangkau mereka. Usulnya: tampilkan pesan lewat timer
 * bila hidrasi tak terjadi dalam ±10 detik. Itu TIDAK dikerjakan karena timernya
 * harus hidup di dalam chunk yang justru sedang gagal dimuat — satu-satunya
 * kondisi yang ingin dilaporkannya. Dua jalan keluar yang benar-benar bekerja
 * keduanya di luar berkas ini dan butuh keputusan lain: (1) skrip inline di
 * server component, dan (2) pengungkap berbasis keyframe CSS di app/globals.css
 * (yang juga harus menghormati prefers-reduced-motion). Keduanya juga menuntut
 * KALIMAT BARU dari content-writer: `copy.tanpaJs` berbunyi "JavaScript sedang
 * tidak aktif", dan itu keterangan yang KELIRU untuk orang yang JavaScript-nya
 * hidup. Sementara itu kerugiannya tertahan: seluruh CTA WhatsApp di halaman ini
 * adalah tautan biasa yang tetap berfungsi tanpa satu baris JavaScript.
 */

/** Batas satu isian teks. Bentuknya sama dengan tiap entri `BATAS_ISIAN`. */
type Batas = { readonly min: number; readonly maks: number };

/** Tiga pesan validasi satu isian teks (tipe `ValidasiTeks` di content/copy). */
type PesanValidasi = FormKontakCopy["validasiLokal"]["nama"];

type NamaBidang = "nama" | "kontak" | "produk" | "pesan";
type Galat = Partial<Record<NamaBidang, string>>;

/**
 * Pemeriksaan satu isian teks.
 *
 * Panjang diukur pada nilai yang sudah di-`trim()` — lihat catatan 2 di kepala
 * berkas. Pesannya dipakai apa adanya: token `{maks}` sudah diisi di sisi server
 * oleh <HalamanKontak> sebelum copy menyeberang ke sini (alasannya di sana).
 */
function periksaTeks(nilai: string, batas: Batas, pesan: PesanValidasi): string | undefined {
  const bersih = nilai.trim();
  if (bersih === "") return pesan.kosong;
  if (bersih.length < batas.min) return pesan.terlaluPendek;
  if (bersih.length > batas.maks) return pesan.terlaluPanjang;
  return undefined;
}

/**
 * Pilihan awal `produk` = "lainnya", nilai yang sama dengan default server
 * (`parsed.data.produk ?? "lainnya"` di app/api/lead/route.ts). Dicari lewat
 * `value`, bukan posisi array, supaya urutan opsi di copy boleh berubah.
 */
function produkAwal(opsi: FormKontakCopy["produk"]["opsi"]): string {
  return (opsi.find((o) => o.value === "lainnya") ?? opsi[0]).value;
}

const kelasLabel = "block font-display text-sm font-bold text-ink";
const kelasBantuan = "mt-1 max-w-[65ch] text-sm text-ink-2";
const kelasGalat = "mt-2 max-w-[65ch] text-sm font-medium text-accent";

/**
 * `text-base` (16px) disengaja: iOS Safari memperbesar halaman saat fokus masuk
 * ke kontrol dengan font < 16px, dan zoom itu memutus aturan mobile-first.
 */
const kelasKontrol = kelas(
  "mt-2 block min-h-11 w-full rounded-xl border bg-surface px-4 py-3 text-base text-ink",
  "placeholder:text-muted motion-safe:transition-colors",
  fokusRing,
);

/**
 * Kotak pemberitahuan: ringkasan validasi dan hasil pengiriman.
 *
 * Sukses dan gagal memakai kotak yang SAMA. Design system BCT hanya punya satu
 * aksen dan tidak boleh ditambahi warna merah/hijau (CLAUDE.md), jadi pembeda
 * keduanya adalah kalimatnya sendiri — yang memang eksplisit di kedua kondisi.
 * Warna juga tidak boleh jadi satu-satunya penanda makna (WCAG 1.4.1).
 */
const kelasKotak = "rounded-xl border border-accent bg-accent-soft px-5 py-4";

// ————————————————————————————————————————————————————————————————
// Deteksi hidrasi (lihat aturan 5 di kepala berkas dan `siap` di bawah)
// ————————————————————————————————————————————————————————————————
// Ketiganya konstanta tingkat modul, bukan fungsi baru tiap render:
// `useSyncExternalStore` berlangganan ulang setiap kali identitas `subscribe`
// berubah, dan snapshot yang identitasnya berubah memicu render tak berujung.
//
// Tidak ada sumber luar yang benar-benar dilanggan — nilainya berpindah sekali
// dari "server" ke "klien" lalu diam selamanya, jadi fungsi berhenti langganan
// ini memang tidak melakukan apa-apa.
const tanpaLangganan = () => () => {};
const dariKlien = () => true;
const dariServer = () => false;

/**
 * Waktu modul ini mulai dijalankan peramban — cadangan untuk `msSejakDibuka()`.
 * Di server nilainya ikut terhitung tapi tidak pernah dipakai: fungsinya hanya
 * dipanggil dari `kirim()`, yang cuma berjalan setelah ada interaksi di browser.
 */
const modulDimuat = Date.now();

/**
 * Berapa milidetik halaman ini sudah terbuka (aturan 10 di kepala berkas).
 *
 * `performance.now()` dihitung dari time origin = awal navigasi, jadi angkanya
 * sudah mencakup waktu muat halaman tanpa perlu menyimpan penanda sendiri, dan
 * jamnya monoton (kebal terhadap koreksi jam sistem/NTP di tengah pengisian).
 * Cadangannya `Date.now()` sejak modul dimuat, untuk peramban tanpa `performance`.
 */
function msSejakDibuka(): number {
  const sejakNavigasi = typeof performance !== "undefined" ? performance.now() : Number.NaN;
  const ms = Number.isFinite(sejakNavigasi) ? sejakNavigasi : Date.now() - modulDimuat;
  return Math.max(0, Math.round(ms));
}

/**
 * Penyembunyian jebakan yang tidak bergantung stylesheet (aturan 11 di kepala
 * berkas). Isinya SAMA PERSIS dengan kelas Tailwind pada elemen yang sama, jadi
 * tidak ada perilaku baru saat CSS normal — hanya kembaran yang tetap berlaku
 * ketika berkas CSS gagal dimuat.
 *
 * Tetap digeser ke luar layar, BUKAN `display:none`: bot yang membaca computed
 * style melewati elemen yang disembunyikan, dan jebakan yang dilewati tidak
 * menangkap apa pun.
 */
const gayaJebakan = {
  position: "absolute",
  left: "-9999px",
  height: 0,
  width: 0,
  overflow: "hidden",
} as const;

/**
 * `tombolWa` = tombol WhatsApp yang SUDAH DIRENDER DI SERVER oleh <HalamanKontak>
 * (<WaButton> dengan label dan pesan prefill dari `kontak.penutup.primer`). Dioper
 * sebagai elemen, bukan dirakit di sini — alasannya aturan 7 di kepala berkas.
 * Dipakai di dua tempat: kotak hasil pengiriman dan <noscript>.
 */
export function FormKontak({ copy, tombolWa }: { copy: FormKontakCopy; tombolWa: ReactNode }) {
  const id = useId();
  const idNama = `${id}-nama`;
  const idKontak = `${id}-kontak`;
  const idProduk = `${id}-produk`;
  const idPesan = `${id}-pesan`;
  const idWebsite = `${id}-website`;

  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  // Lihat catatan pada `penandaOpsional` di content/copy/kontak.ts: dengan
  // "Belum tahu, mau diskusi dulu" sebagai pilihan awal, pengunjung tidak pernah
  // dihadapkan pada isian kosong — jadi form ini sengaja tidak merender penanda
  // "opsional" dan tidak memasang <option> kosong (yang butuh label karangan).
  const [produk, setProduk] = useState<string>(produkAwal(copy.produk.opsi));
  const [pesan, setPesan] = useState("");
  const [website, setWebsite] = useState("");

  const [galat, setGalat] = useState<Galat>({});
  const [mengirim, setMengirim] = useState(false);
  // Teks hasil pengiriman apa adanya (sukses maupun gagal), diambil dari `copy`.
  const [hasil, setHasil] = useState<string | null>(null);
  /**
   * "Komponen ini sudah terhidrasi." Satu-satunya gunanya: menahan tombol submit
   * selama `onSubmit` di bawah belum benar-benar terpasang.
   *
   * <form> ini TIDAK punya `action`/`method` — seluruh pengirimannya lewat
   * `kirim()` yang memanggil `preventDefault()`. Sampai React selesai
   * menghidrasi, `preventDefault()` itu belum ada, sehingga tombol submit yang
   * aktif di HTML kiriman server membuat browser menjalankan pengiriman BAWAAN:
   * GET ke URL halaman ini sendiri dengan tiap isian jadi query string. Nama,
   * nomor WhatsApp/email, dan seluruh isi pesan pengunjung ikut masuk riwayat
   * browser, log akses CDN, dan tautan yang bisa dibagikan — sementara lead-nya
   * TIDAK pernah sampai ke /api/lead, tulisan pengunjung hilang, dan tidak ada
   * satu pun pesan galat. Itu persis "lead hilang senyap" yang dilarang ADR
   * 2026-08-25, ditambah kebocoran data pribadi. Terbukti terjadi di peramban
   * sungguhan pada dua kondisi: chunk JS tertahan (jaringan lambat) dan JS
   * dimatikan penuh.
   *
   * `useSyncExternalStore` dipakai persis untuk kasus "nilainya berbeda antara
   * server dan klien": React memakai `dariServer` (false) saat render server DAN
   * saat render hidrasi, jadi markupnya identik dan tidak ada mismatch, lalu
   * mengganti ke `dariKlien` (true) tepat setelah commit hidrasi — detik yang
   * sama saat `onSubmit` benar-benar hidup. Bukan `useState` + `useEffect`:
   * memanggil setState di badan effect ditolak eslint (react-hooks
   * /set-state-in-effect), dan menonaktifkan aturannya bukan pilihan.
   */
  const siap = useSyncExternalStore(tanpaLangganan, dariKlien, dariServer);

  // Dua penghitung ini hanya penanda "ada kejadian baru" supaya fokus tetap
  // berpindah walau pesannya sama dengan percobaan sebelumnya (nilai state yang
  // identik tidak memicu effect).
  const [rondeGalat, setRondeGalat] = useState(0);
  const [rondeHasil, setRondeHasil] = useState(0);
  const ringkasanRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  /**
   * Pagar klik ganda yang sebenarnya. `disabled` pada tombol dan state `mengirim`
   * baru berlaku setelah React merender ulang, sedangkan beberapa klik yang jatuh
   * di TASK yang sama (klik beruntun sangat cepat, atau skrip) menjalankan handler
   * ini berkali-kali sebelum render itu terjadi — terbukti mengirim 3 POST dari 3
   * klik. Ref berubah seketika, jadi klik kedua dan ketiga berhenti di sini.
   */
  const sedangKirim = useRef(false);

  /**
   * Lapis 5b: penjaga `submit` fase capture.
   *
   * `form.requestSubmit()` MELEWATI `disabled` pada tombol — spesifikasi hanya
   * menyuruh peramban membatalkan pengiriman IMPLISIT (Enter) ketika tombol
   * default nonaktif, bukan pengiriman yang diminta skrip. Tanpa penjaga ini,
   * satu baris di konsol/ekstensi/XSS memicu pengiriman bawaan dan seluruh isian
   * ikut ke query string.
   *
   * Fase capture, bukan bubble: ia berjalan sebelum handler React (`onSubmit`
   * dikirim React dari akar pohon saat event menggelembung), jadi
   * `preventDefault()`-nya pasti keburu. Propagasi TIDAK dihentikan — `kirim()`
   * tetap dipanggil dan tetap menolak sendiri lewat pagar `sedangKirim`.
   *
   * Dipasang ulang setiap kali `siap` berubah karena penutupnya membaca nilai itu.
   * Yang tidak bisa dijangkau dari sini: jendela SEBELUM chunk ini hidup (tidak
   * ada JavaScript yang bisa memasang listener) dan `form.submit()` (tidak memicu
   * event `submit` sama sekali). Keduanya ditangani lapis 5c — `action` POST.
   */
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const tahan = (peristiwa: Event) => {
      if (!siap || sedangKirim.current) peristiwa.preventDefault();
    };
    form.addEventListener("submit", tahan, true);
    return () => form.removeEventListener("submit", tahan, true);
  }, [siap]);

  useEffect(() => {
    if (rondeGalat > 0) ringkasanRef.current?.focus();
  }, [rondeGalat]);

  // Tombol kirim di-`disabled` selama pengiriman, dan browser melepas fokus dari
  // elemen yang dinonaktifkan. Tanpa pemindahan ini fokus terdampar di <body>,
  // jauh dari pesan hasil yang baru muncul.
  useEffect(() => {
    if (rondeHasil > 0) statusRef.current?.focus();
  }, [rondeHasil]);

  async function kirim(peristiwa: FormEvent<HTMLFormElement>) {
    peristiwa.preventDefault();
    if (sedangKirim.current) return;

    const v = copy.validasiLokal;
    const galatBaru: Galat = {
      nama: periksaTeks(nama, BATAS_ISIAN.nama, v.nama),
      kontak: periksaTeks(kontak, BATAS_ISIAN.kontak, v.kontak),
      pesan: periksaTeks(pesan, BATAS_ISIAN.pesan, v.pesan),
      // Jaring pengaman: nilai di luar daftar hanya mungkin muncul bila isian
      // lama dipulihkan browser. Honeypot sengaja TIDAK diperiksa di sini.
      produk: copy.produk.opsi.some((o) => o.value === produk) ? undefined : v.produk.tidakDikenali,
    };

    setGalat(galatBaru);
    if (Object.values(galatBaru).some(Boolean)) {
      setHasil(null);
      setRondeGalat((n) => n + 1);
      return;
    }

    sedangKirim.current = true;
    setMengirim(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // `sejakDibuka` = aturan 10 di kepala berkas. Diukur di sini, bukan saat
        // isian pertama diketik: yang ingin dibedakan server adalah "halaman baru
        // dibuka lalu langsung dikirim", bukan lama-tidaknya mengetik.
        body: JSON.stringify({ nama, kontak, produk, pesan, website, sejakDibuka: msSejakDibuka() }),
      });

      // Pemetaan status → copy: tabel di content/copy/kontak.ts. Jangan
      // menggabung 503 ke `gagal` — keduanya menuntut tindakan berbeda dari
      // pengunjung ("coba lagi" vs "pindah ke WhatsApp").
      switch (res.status) {
        case 200:
          // Satu-satunya kondisi yang mengosongkan isian: form kembali ke keadaan
          // awal seutuhnya, termasuk `produk` (yang tidak punya keadaan "kosong",
          // jadi setaranya adalah pilihan awal yang netral).
          setHasil(copy.sukses);
          setNama("");
          setKontak("");
          setPesan("");
          setWebsite("");
          setProduk(produkAwal(copy.produk.opsi));
          break;
        case 413:
        case 422:
          setHasil(copy.gagalValidasi);
          break;
        case 429:
          setHasil(copy.gagalRateLimit);
          break;
        case 503:
          // Isian SENGAJA dibiarkan utuh; lihat catatan 3 di kepala berkas.
          setHasil(copy.gagalBelumSiap);
          break;
        default:
          // 400, 502, dan status apa pun yang tak terduga.
          setHasil(copy.gagal);
      }
    } catch {
      // Jaringan putus, permintaan dibatalkan, atau balasan tidak pernah tiba.
      setHasil(copy.gagal);
    } finally {
      sedangKirim.current = false;
      setMengirim(false);
      setRondeHasil((n) => n + 1);
    }
  }

  const idRingkasan = `${id}-ringkasan`;

  return (
    /* `method`/`action` = lapis 5c di kepala berkas: penampung terakhir, BUKAN jalur
       pengiriman yang sebenarnya. Setiap kiriman sah berhenti di `onSubmit` →
       `kirim()` → `preventDefault()`, jadi atribut ini tidak pernah dipakai pada
       pemakaian normal. Ia hanya menentukan KE MANA pengiriman bawaan pergi kalau
       ada yang berhasil memicunya (paling nyata: `form.submit()` dari skrip, yang
       tidak memicu event `submit` sehingga tak satu pun listener bisa mencegahnya).
       Dengan POST, isian berpindah ke body — bukan ke query string. Endpoint-nya
       membalas 415 karena <form> bawaan tidak pernah mengirim `application/json`,
       jadi tidak ada lead palsu yang lolos lewat jalur ini.
       JANGAN diganti menjadi GET atau ditujukan ke halaman ini sendiri: itu persis
       kebocoran yang ditutup blocker [TINGGI] audit W2-07. */
    <form
      ref={formRef}
      noValidate
      method="post"
      action="/api/lead"
      onSubmit={kirim}
      className="mt-10 max-w-2xl"
    >
      {Object.values(galat).some(Boolean) ? (
        <div
          ref={ringkasanRef}
          id={idRingkasan}
          role="alert"
          tabIndex={-1}
          className={kelas(kelasKotak, "mb-8", fokusRing)}
        >
          <p className="max-w-[65ch] text-sm font-medium text-ink">{copy.validasiLokal.ringkasan}</p>
        </div>
      ) : null}

      <Bidang idKontrol={idNama} label={copy.nama.label} galat={galat.nama} idGalat={`${idNama}-galat`}>
        <input
          id={idNama}
          name="nama"
          type="text"
          autoComplete="name"
          required
          minLength={BATAS_ISIAN.nama.min}
          // Tanpa `maxLength` — aturan 8 di kepala berkas.
          placeholder={copy.nama.placeholder}
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          aria-describedby={`${idNama}-galat`}
          aria-invalid={galat.nama ? true : undefined}
          className={kelas(kelasKontrol, galat.nama ? "border-accent" : "border-line")}
        />
      </Bidang>

      <Bidang
        idKontrol={idKontak}
        label={copy.kontak.label}
        bantuan={copy.kontak.bantuan}
        idBantuan={`${idKontak}-bantuan`}
        galat={galat.kontak}
        idGalat={`${idKontak}-galat`}
      >
        <input
          id={idKontak}
          name="kontak"
          type="text"
          // Bukan type="email": isian ini menerima nomor WhatsApp ATAU email, dan
          // type="email" menyalakan validasi bawaan browser untuk nomor telepon.
          // `autoComplete` sengaja tidak diisi: tokennya harus tunggal ("tel" ATAU
          // "email"), sementara isian ini menerima keduanya.
          required
          minLength={BATAS_ISIAN.kontak.min}
          // Tanpa `maxLength` — aturan 8 di kepala berkas.
          placeholder={copy.kontak.placeholder}
          value={kontak}
          onChange={(e) => setKontak(e.target.value)}
          aria-describedby={`${idKontak}-bantuan ${idKontak}-galat`}
          aria-invalid={galat.kontak ? true : undefined}
          className={kelas(kelasKontrol, galat.kontak ? "border-accent" : "border-line")}
        />
      </Bidang>

      <Bidang
        idKontrol={idProduk}
        label={copy.produk.label}
        bantuan={copy.produk.bantuan}
        idBantuan={`${idProduk}-bantuan`}
        galat={galat.produk}
        idGalat={`${idProduk}-galat`}
      >
        <select
          id={idProduk}
          name="produk"
          value={produk}
          onChange={(e) => setProduk(e.target.value)}
          aria-describedby={`${idProduk}-bantuan ${idProduk}-galat`}
          aria-invalid={galat.produk ? true : undefined}
          className={kelas(kelasKontrol, galat.produk ? "border-accent" : "border-line")}
        >
          {copy.produk.opsi.map((opsi) => (
            <option key={opsi.value} value={opsi.value}>
              {opsi.label}
            </option>
          ))}
        </select>
      </Bidang>

      <Bidang
        idKontrol={idPesan}
        label={copy.pesan.label}
        bantuan={copy.pesan.bantuan}
        idBantuan={`${idPesan}-bantuan`}
        galat={galat.pesan}
        idGalat={`${idPesan}-galat`}
      >
        {/* Tanpa `maxLength` — aturan 8 di kepala berkas. Isian inilah yang paling
            terasa akibatnya: cerita panjang akan terpangkas diam-diam di tengah
            kalimat, dan `validasiLokal.pesan.terlaluPanjang` (satu-satunya pesan
            yang menyebut angka batas dan menyuruh meringkas sendiri) tidak akan
            pernah muncul. */}
        <textarea
          id={idPesan}
          name="pesan"
          rows={6}
          required
          minLength={BATAS_ISIAN.pesan.min}
          placeholder={copy.pesan.placeholder}
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          aria-describedby={`${idPesan}-bantuan ${idPesan}-galat`}
          aria-invalid={galat.pesan ? true : undefined}
          className={kelas(kelasKontrol, "resize-y", galat.pesan ? "border-accent" : "border-line")}
        />
      </Bidang>

      {/* Jebakan bot. Wajib ADA di DOM lengkap dengan <label> (itu yang membuat bot
          mengisinya), tapi wajib TIDAK terlihat, TIDAK terjangkau Tab, dan TIDAK
          dibacakan pembaca layar.
          - Digeser ke luar layar, bukan `display:none`: bot yang membaca computed
            style melewati elemen yang disembunyikan, dan jebakan yang dilewati
            tidak menangkap apa pun. Geseran ke KIRI tidak pernah menimbulkan
            gulir horizontal pada arah tulisan kiri-ke-kanan.
          - Kelas Tailwind DAN `style` inline yang isinya sama persis. Bukan
            duplikasi yang terlupa dibersihkan: kelas butuh stylesheet situs, dan
            saat berkas CSS gagal dimuat isian ini pernah terukur setinggi 21 px —
            terlihat, terisi pengunjung, lalu leadnya dibuang di server sambil
            dibalas "Pesan Anda terkirim" (G-21c). Inline style tidak punya
            ketergantungan itu. Ubah salah satu = ubah keduanya.
          - `aria-hidden` menutupinya dari pembaca layar, `tabIndex={-1}`
            mengeluarkannya dari urutan Tab (sekaligus syarat agar `aria-hidden`
            tidak membungkus elemen yang bisa difokus).
          Nilainya tidak pernah divalidasi di sini: keputusannya milik server, di
          titik yang balasannya identik dengan kiriman sah — termasuk lamanya
          (app/api/lead/route.ts, `jedaSeolahDiteruskan`). */}
      <div
        aria-hidden="true"
        style={gayaJebakan}
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={idWebsite}>{copy.situs.label}</label>
        <input
          id={idWebsite}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <p className="mt-8 max-w-[65ch] text-sm text-ink-2">{copy.catatanPrivasi}</p>

      {/* Pesan untuk pengunjung tanpa JavaScript, TEPAT di atas tombol kirim: ia
          dibaca sebelum tombol yang tidak akan bekerja itu sempat ditekan.
          - WAJIB di dalam <noscript>, DILARANG dipasang lewat state hidrasi
            (`!siap`). Jendela pra-hidrasi dilewati SETIAP pengunjung pada setiap
            pemuatan, jadi `!siap` akan membuat pesan ini berkedip di form yang
            sehat dan mengaku "JavaScript mati" kepada orang yang JavaScript-nya
            hidup — persis alasan tombol di bawah tidak ikut diredupkan.
          - BUKAN pengganti `gagalBelumSiap`, dan sebaliknya: yang itu bicara soal
            balasan 503, kondisi yang justru hanya bisa muncul ketika JavaScript
            hidup dan kiriman benar-benar berangkat.
          - Nol biaya tata letak bagi pengunjung biasa. Saat skrip aktif, peramban
            memarsing isi <noscript> sebagai TEKS mentah dan tidak membuatkannya kotak
            layout sama sekali (terukur di Chromium: getClientRects().length 0, lebar
            dan tinggi 0 — bukan lewat display:none, computed display-nya tetap
            "inline"). Jadi kotak ini tidak pernah dirender, tidak menggeser apa pun,
            dan mustahil berkedip. Karena isinya teks, React juga tidak menghidrasinya,
            jadi tidak ada mismatch. Itu pula sebabnya kotak ini TIDAK boleh diberi
            kelas penyembunyi sendiri: kelas apa pun dari stylesheet situs ikut berlaku
            saat JavaScript mati, dan justru menyembunyikannya dari satu-satunya orang
            yang perlu membacanya.
          - Tombolnya memakai ulang prop `tombolWa` yang sama dengan kotak hasil —
            tanpa label karangan baru, dan nomornya tetap hanya dari `waLink()`.
            Bentuknya <a>, jadi tombol kirim tetap satu-satunya <button
            type="submit"> di dalam <form> (lihat komentar di bawah). */}
      <noscript>
        <div className={kelas(kelasKotak, "mt-8")}>
          <p className="max-w-[65ch] text-sm font-medium text-ink">{copy.tanpaJs}</p>
          {/* Pembungkus, bukan `mt-4` yang ditempel pada tombolnya sendiri: jarak
              adalah keputusan tata letak form ini, sedangkan prop `tombolWa` hanya
              membawa identitas tombol. `flex` (bukan blok biasa) membuat <a> yang
              `inline-flex` itu menjadi flex item, sehingga tidak ada ruang turunan
              baris yang diam-diam menambah tinggi kotak. */}
          <div className="mt-4 flex">{tombolWa}</div>
        </div>
      </noscript>

      {/* `disabled` di sini menutup DUA jalur pengiriman bawaan sekaligus:
          - klik — tombol nonaktif tidak punya activation behavior;
          - Enter di isian teks — spesifikasi HTML menyuruh browser membatalkan
            pengiriman implisit bila tombol default form-nya nonaktif.
          Keduanya diuji dengan peramban sungguhan, dengan chunk JS ditahan dan
          dengan JS dimatikan penuh. Karena penjagaannya bersandar pada status
          "tombol default", tombol ini WAJIB tetap satu-satunya <button
          type="submit"> di dalam <form>: menambah yang kedua memindahkan status
          itu ke tombol lain dan membuka lagi jalur Enter. */}
      <button
        type="submit"
        disabled={!siap || mengirim}
        className={kelas(
          tombolPrimer,
          "mt-6 w-full sm:w-auto",
          "disabled:cursor-not-allowed disabled:hover:bg-accent",
          // Peredupan HANYA saat `mengirim`, SENGAJA tidak saat menunggu hidrasi.
          // Jendela pra-hidrasi dilewati setiap pengunjung pada setiap pemuatan
          // halaman; kalau tombolnya ikut diredupkan, semua orang melihat kedipan
          // "mati lalu hidup" pada form yang sebenarnya sehat — tanda visual untuk
          // keadaan yang jarang terjadi dibayar dengan cacat visual yang selalu
          // terjadi. Isyarat `cursor-not-allowed` di atas tetap berlaku di kedua
          // keadaan: ia hanya muncul saat penunjuk memang berada di atas tombol,
          // jadi tidak pernah terlihat sebagai kedipan.
          mengirim && "opacity-70",
        )}
      >
        {mengirim ? copy.tombolMengirim : copy.tombolKirim}
      </button>

      {/* Wadah status selalu ada di DOM sejak awal supaya pembaca layar benar-benar
          mengumumkan isinya saat muncul (live region yang baru dibuat sering
          terlewat). Kosong = nol tinggi, jadi tidak ada ruang menganggur. */}
      <div ref={statusRef} role="status" tabIndex={-1} className={kelas(hasil && "mt-6", fokusRing)}>
        {hasil ? (
          <div className={kelasKotak}>
            <p className="max-w-[65ch] text-sm font-medium text-ink">{hasil}</p>
            {/* Label & pesan prefill diambil dari CTA penutup halaman ini
                (content/copy/kontak.ts), bukan teks baru: setiap pesan hasil —
                sukses maupun gagal — menutup dengan mengarahkan ke WhatsApp.
                Elemennya datang sudah jadi dari server lewat prop `tombolWa`
                (aturan 7 di kepala berkas); pembungkusnya sama dengan yang di
                <noscript> di atas. */}
            <div className="mt-4 flex">{tombolWa}</div>
          </div>
        ) : null}
      </div>
    </form>
  );
}

/**
 * Satu baris isian: label sungguhan + teks bantuan + kontrol + slot galat.
 *
 * Slot galat selalu dirender (walau kosong) supaya `aria-describedby` kontrol
 * boleh menunjuknya tanpa syarat, dan `aria-live` di dalamnya sudah ada di DOM
 * sebelum pesannya muncul.
 */
function Bidang({
  idKontrol,
  label,
  bantuan,
  idBantuan,
  galat,
  idGalat,
  children,
}: {
  idKontrol: string;
  label: string;
  bantuan?: string;
  idBantuan?: string;
  galat?: string;
  idGalat: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <label htmlFor={idKontrol} className={kelasLabel}>
        {label}
      </label>
      {bantuan ? (
        <p id={idBantuan} className={kelasBantuan}>
          {bantuan}
        </p>
      ) : null}
      {children}
      <div id={idGalat} aria-live="polite">
        {galat ? <p className={kelasGalat}>{galat}</p> : null}
      </div>
    </div>
  );
}
