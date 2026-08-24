import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { LinkButton } from "@/components/link-button";
import { fokusRing, kelas, tautanTeks, wadah } from "@/components/styles";
import { WaButton } from "@/components/wa-button";
import { beranda } from "@/content/copy";
import { bukti, produk, site } from "@/content/site";

/**
 * Beranda.
 *
 * Seluruh teks berasal dari `beranda` (content/copy/beranda.ts); nama produk,
 * harga, lokasi, dan nomor WhatsApp dari content/site.ts. Tidak ada satu pun
 * angka harga, nomor WA, atau email yang ditulis di file ini.
 *
 * Tautan /pricing, /studi-kasus, dan /produk/* menuju halaman yang baru dibuat
 * pada sprint W2 (sitemap CLAUDE.md) — sengaja sudah dipasang.
 */
export const metadata: Metadata = {
  // `title.template` di app/layout.tsx HANYA berlaku untuk segmen anak, bukan
  // untuk page.tsx yang berada di segmen root yang sama dengan layout itu.
  // Karena itu sufiks merek disusun eksplisit di sini lewat `absolute`, supaya
  // pola judul "X — <nama merek>" tetap terbit di beranda.
  title: { absolute: `${beranda.meta.title} — ${site.name}` },
  description: beranda.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${beranda.meta.title} — ${site.name}`,
    description: beranda.meta.description,
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: site.name,
    // Berkas OG image belum ada. Menyusul di W3-01 (SEO & OG image) — jangan
    // menambahkan `images` dengan path karangan sebelum asetnya benar-benar ada.
  },
};

/**
 * Angka & label bukti berasal dari `bukti[]` (content/site.ts); kalimat penjelas
 * dari `beranda.bukti.detail[]`. Pencocokannya MENGIKUTI URUTAN ARRAY — lihat
 * komentar `kunci` di content/copy/beranda.ts. `.at()` mengembalikan `undefined`
 * bila panjang kedua array tidak sama, sehingga blok penjelas cukup tidak
 * dirender (tidak pernah muncul "undefined" atau error).
 */
const daftarBukti = bukti.map((item, indeks) => ({
  angka: item.angka,
  label: item.label,
  detail: beranda.bukti.detail.at(indeks)?.teks,
}));

const kelasJudulSection = "mt-5 max-w-[22ch] font-display text-3xl font-extrabold sm:text-4xl";
const kelasParagrafSection = "mt-4 max-w-[65ch] text-ink-2";
const kelasBarisTombol = "mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center";

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className={kelas(wadah, "py-16 sm:py-24")}>
        {/* Eyebrow copy + lokasi dari content/site.ts (diizinkan oleh komentar di copy). */}
        <Eyebrow>{`${beranda.hero.eyebrow} · ${site.location}`}</Eyebrow>
        <h1 className="mt-6 max-w-[20ch] text-4xl font-extrabold sm:text-5xl lg:text-6xl">
          {beranda.hero.judul}
        </h1>
        <p className="mt-6 max-w-[65ch] text-lg text-ink-2">{beranda.hero.teks}</p>
        <div className={kelasBarisTombol}>
          <WaButton pesan={beranda.hero.primer.pesan}>{beranda.hero.primer.label}</WaButton>
          {beranda.hero.sekunder ? (
            <LinkButton href={beranda.hero.sekunder.href}>{beranda.hero.sekunder.label}</LinkButton>
          ) : null}
        </div>
      </section>

      {/* ---------- Tiga lini produk ---------- */}
      <section aria-labelledby="judul-produk" className={kelas(wadah, "py-16 sm:py-20")}>
        <Eyebrow>{beranda.produk.eyebrow}</Eyebrow>
        <h2 id="judul-produk" className={kelasJudulSection}>
          {beranda.produk.judul}
        </h2>
        {beranda.produk.teks ? <p className={kelasParagrafSection}>{beranda.produk.teks}</p> : null}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produk.map((item) => {
            // Paket pertama = paket masuk untuk lini ini. Harga TIDAK PERNAH
            // diketik di komponen, selalu dari content/site.ts.
            const paketMasuk = item.paket.at(0);
            return (
              <li key={item.slug} className="flex">
                <Link
                  href={`/produk/${item.slug}`}
                  className={kelas(
                    "group flex w-full flex-col rounded-2xl border border-line bg-surface p-6",
                    "hover:border-accent motion-safe:transition-colors",
                    fokusRing,
                  )}
                >
                  <h3 className="flex items-start justify-between gap-3 font-display text-xl font-bold text-ink">
                    {item.nama}
                    <span
                      aria-hidden="true"
                      className="text-muted group-hover:text-accent motion-safe:transition-colors"
                    >
                      &rarr;
                    </span>
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-ink-2">{item.ringkas}</p>
                  {paketMasuk ? (
                    <p className="mt-6 border-t border-line pt-4 font-mono">
                      <span className="block text-xs uppercase tracking-[0.14em] text-muted">
                        {paketMasuk.nama}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-ink">
                        {paketMasuk.harga}
                        {paketMasuk.satuan ?? ""}
                      </span>
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- Bukti / rekam jejak ---------- */}
      <section aria-labelledby="judul-bukti" className={kelas(wadah, "py-16 sm:py-20")}>
        <Eyebrow>{beranda.bukti.kepala.eyebrow}</Eyebrow>
        <h2 id="judul-bukti" className={kelasJudulSection}>
          {beranda.bukti.kepala.judul}
        </h2>
        {beranda.bukti.kepala.teks ? (
          <p className={kelasParagrafSection}>{beranda.bukti.kepala.teks}</p>
        ) : null}

        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {daftarBukti.map((item) => (
            <li key={item.label} className="border-t border-line pt-5">
              <h3 className="font-display text-2xl font-extrabold text-ink">{item.angka}</h3>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                {item.label}
              </p>
              {item.detail ? (
                <p className="mt-4 max-w-[65ch] text-sm text-ink-2">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mt-10">
          <Link href={beranda.bukti.tautan.href} className={tautanTeks}>
            {beranda.bukti.tautan.label}
          </Link>
        </p>
      </section>

      {/* ---------- Cara kerja ---------- */}
      <section aria-labelledby="judul-cara-kerja" className="border-y border-line bg-surface">
        <div className={kelas(wadah, "py-16 sm:py-20")}>
          <Eyebrow>{beranda.caraKerja.kepala.eyebrow}</Eyebrow>
          <h2 id="judul-cara-kerja" className={kelasJudulSection}>
            {beranda.caraKerja.kepala.judul}
          </h2>
          {beranda.caraKerja.kepala.teks ? (
            <p className={kelasParagrafSection}>{beranda.caraKerja.kepala.teks}</p>
          ) : null}

          <ol className="mt-10 grid gap-8 sm:grid-cols-2">
            {beranda.caraKerja.langkah.map((langkah) => (
              <li key={langkah.nomor} className="border-t border-line pt-5">
                <span className="font-mono text-sm font-semibold tracking-[0.14em] text-accent">
                  {langkah.nomor}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{langkah.judul}</h3>
                <p className="mt-2 max-w-[65ch] text-sm text-ink-2">{langkah.teks}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Penutup / CTA ---------- */}
      <section aria-labelledby="judul-penutup" className={kelas(wadah, "py-16 sm:py-24")}>
        <div className="rounded-3xl border border-line bg-surface p-8 sm:p-12">
          <Eyebrow>{beranda.penutup.eyebrow}</Eyebrow>
          <h2 id="judul-penutup" className={kelasJudulSection}>
            {beranda.penutup.judul}
          </h2>
          <p className={kelasParagrafSection}>{beranda.penutup.teks}</p>
          <div className={kelasBarisTombol}>
            <WaButton pesan={beranda.penutup.primer.pesan}>{beranda.penutup.primer.label}</WaButton>
            {beranda.penutup.sekunder ? (
              <LinkButton href={beranda.penutup.sekunder.href}>
                {beranda.penutup.sekunder.label}
              </LinkButton>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
