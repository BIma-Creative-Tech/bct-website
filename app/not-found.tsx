import Link from "next/link";
import type { Metadata } from "next";
import { LinkButton } from "@/components/link-button";
import { SectionHalaman, kelasBarisTombol, kelasJudulSection } from "@/components/sections";
import { fokusRing, kelas } from "@/components/styles";
import { WaButton } from "@/components/wa-button";
import { tidakDitemukan } from "@/content/copy";
import { saringTautan, tautanHidup } from "@/content/rute";
import { produk, site } from "@/content/site";

/**
 * Halaman 404 seluruh situs (rute /_not-found).
 *
 * Menggantikan layar bawaan Next yang berbahasa Inggris. Karena file ini tetap
 * dibungkus app/layout.tsx, pengunjung yang tersasar tetap melihat nav, footer,
 * dan tombol WhatsApp mengambang — jalur ke chat tidak putus.
 *
 * Teks: content/copy/tidak-ditemukan.ts. Nama produk: produk[] di content/site.ts,
 * dicocokkan lewat slug (pola yang sama dipakai components/site-nav.tsx). Tidak ada
 * kalimat, nama merek, nomor WhatsApp, atau harga yang diketik di file ini.
 *
 * TAUTAN (W2-12): halaman ini tidak boleh mengirim pengunjung dari 404 ke 404,
 * jadi setiap tautan disaring `saringTautan()` / `tautanHidup()` dari
 * content/rute.ts — penyaring yang sama dengan nav, footer, dan halaman lain.
 * Sebelumnya aturan itu ditulis tangan di sini; sekarang daftar rute hidupnya
 * cuma ada di content/rute.ts. `tidakDitemukan.sekunder` menuju "/" yang selalu
 * terdaftar hidup, jadi jalan pulang pengunjung tidak pernah hilang.
 */

/**
 * CATATAN TEKNIS — ekspor `metadata` di not-found.tsx (diselidiki untuk W2-09).
 *
 * Dokumentasi Next 16.3.2 (node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/not-found.md, bagian "Metadata") HANYA menyebut ekspor
 * `metadata` untuk `global-not-found.js`, bukan untuk `not-found.js`. Karena itu
 * ekspor di bawah diuji dulu, bukan diasumsikan bekerja.
 *
 * HASIL UJI (build produksi 16.3.2, `next start` + curl rute tak dikenal):
 * BEKERJA. Respons 404 menerbitkan TEPAT SATU <title>, yaitu
 * "Halaman tidak ditemukan — Bima Creative Tech" (sufiks dari `title.template`
 * di app/layout.tsx), dan judul Inggris "404: This page could not be found."
 * hilang sepenuhnya. `experimental.globalNotFound` TIDAK dinyalakan.
 *
 * SEBABNYA (build/webpack/loaders/next-app-loader/index.js): saat custom
 * not-found.js ada dan globalNotFound mati, loader memasang modul ini sebagai
 * `page` pada pohon rute /_not-found — jadi resolver metadata membacanya seperti
 * page biasa. Judul Inggris itu sendiri bukan produk sistem metadata, melainkan
 * elemen <title> hardcoded di dalam JSX komponen bawaan
 * (client/components/http-access-fallback/error-fallback.js); begitu komponen
 * bawaan tidak dipakai lagi, elemen itu ikut hilang.
 *
 * RISIKO: perilaku ini tidak didokumentasikan, jadi bisa berubah tanpa catatan
 * rilis. Bila suatu saat <title> Inggris muncul lagi setelah upgrade Next,
 * periksa ulang di sini lebih dulu — jangan langsung menyalakan
 * `experimental.globalNotFound` (perubahan next.config.ts = gerbang konfirmasi
 * owner + wajib audit security-auditor).
 *
 * `robots: noindex` tidak ditulis manual: Next menyuntikkannya otomatis untuk
 * respons berstatus 404 (diverifikasi pada HTML hasil build).
 */
export const metadata: Metadata = {
  title: tidakDitemukan.meta.title,
  description: tidakDitemukan.meta.description,
  // openGraph.title disusun eksplisit dengan sufiks merek: `title.template` di
  // root layout hanya berlaku untuk <title>, tidak untuk og:title (pola yang sama
  // dipakai components/sections/metadata-produk.ts). `alternates.canonical`
  // sengaja tidak dipasang — halaman ini tidak punya URL kanonik.
  //
  // og:image-nya diwarisi dari app/opengraph-image.tsx karena berkas ini berada di
  // segmen root, jadi kartu share-nya memuat judul beranda. Disengaja; alasannya
  // di kepala app/opengraph-image.tsx.
  openGraph: {
    title: `${tidakDitemukan.meta.title} — ${site.name}`,
    description: tidakDitemukan.meta.description,
    type: "website",
    locale: "id_ID",
    siteName: site.name,
  },
};

const ID_JUDUL = {
  utama: "judul-utama",
  bantu: "judul-tautan-bantu",
} as const;

/** Nama produk diambil dari content/site.ts lewat slug; subLabel dari content/copy.
 *  flatMap dipakai agar slug yang tidak ada di site.ts dilewati, bukan dirender kosong. */
const tautanProduk = saringTautan(tidakDitemukan.tautanBantu).flatMap((item) => {
  const data = produk.find((p) => p.slug === item.slug);
  return data ? [{ slug: item.slug, href: item.href, nama: data.nama, subLabel: item.subLabel }] : [];
});

const tautanPulang = tautanHidup(tidakDitemukan.sekunder);

export default function TidakDitemukan() {
  return (
    <>
      <SectionHalaman idJudul={ID_JUDUL.utama}>
        <p
          aria-hidden="true"
          className="font-mono text-5xl font-semibold tracking-tight text-accent sm:text-6xl"
        >
          {tidakDitemukan.kode}
        </p>
        <h1 id={ID_JUDUL.utama} className="mt-6 max-w-[20ch] text-4xl font-extrabold sm:text-5xl">
          {tidakDitemukan.judul}
        </h1>
        <p className="mt-6 max-w-[65ch] text-lg text-ink-2">{tidakDitemukan.teks}</p>
        <div className={kelasBarisTombol}>
          <WaButton pesan={tidakDitemukan.primer.pesan}>{tidakDitemukan.primer.label}</WaButton>
          {tautanPulang ? (
            <LinkButton href={tautanPulang.href}>{tautanPulang.label}</LinkButton>
          ) : null}
        </div>
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.bantu} latar="surface">
        <h2 id={ID_JUDUL.bantu} className={kelasJudulSection}>
          {tidakDitemukan.judulTautanBantu}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tautanProduk.map((item) => (
            <li key={item.slug} className="flex">
              <Link
                href={item.href}
                className={kelas(
                  "group flex w-full flex-col rounded-2xl border border-line bg-surface p-6",
                  "hover:border-accent motion-safe:transition-colors",
                  fokusRing,
                )}
              >
                <h3 className="flex items-start justify-between gap-3 font-display text-lg font-bold text-ink">
                  {item.nama}
                  <span
                    aria-hidden="true"
                    className="text-muted group-hover:text-accent motion-safe:transition-colors"
                  >
                    &rarr;
                  </span>
                </h3>
                <p className="mt-3 text-sm text-ink-2">{item.subLabel}</p>
              </Link>
            </li>
          ))}
        </ul>
      </SectionHalaman>
    </>
  );
}
