import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlobLatar } from "@/components/blob-latar";
import { CahayaKursor } from "@/components/cahaya-kursor";
import { Eyebrow } from "@/components/eyebrow";
import {
  IkonBidang,
  IkonTeknologiDeret,
  IkonTeknologiMelayang,
  type NamaIkon,
} from "@/components/ikon-teknologi";
import { JudulSorot } from "@/components/judul-sorot";
import { LinkButton } from "@/components/link-button";
import {
  chipIkon,
  fokusRing,
  kartuInteraktif,
  kelas,
  nomorBesar,
  tautanTeks,
  wadah,
} from "@/components/styles";
import { WaButton } from "@/components/wa-button";
import { beranda } from "@/content/copy";
import { ruteHidup, tautanHidup } from "@/content/rute";
import { bukti, produk, site, statistik, type Paket, type SlugProduk } from "@/content/site";

/**
 * Beranda.
 *
 * Seluruh teks berasal dari `beranda` (content/copy/beranda.ts); nama produk,
 * harga, lokasi, dan nomor WhatsApp dari content/site.ts. Tidak ada satu pun
 * angka harga, nomor WA, atau email yang ditulis di file ini.
 *
 * TAUTAN (W2-12): tautan copy di halaman ini dilewatkan `tautanHidup()` /
 * `ruteHidup()` dari content/rute.ts, penyaring yang sama dengan nav, footer,
 * <HeroHalaman>, dan <BlokCtaPenutup>. Tombol hero "Lihat Portofolio Kami" tidak
 * disembunyikan melainkan dialihkan ke jangkar `#rekam-jejak` selama /studi-kasus
 * belum hidup (lihat `hrefPortofolio`). `beranda.bukti.tautan` ("Lihat studi kasus") karena itu
 * TIDAK tayang selama /studi-kasus belum ada — section rekam jejak tetap berisi
 * kepala + tiga angka bukti, jadi tidak ada judul kosong (preseden ADR 2026-08-25).
 * Copy-nya dibiarkan utuh dan menyala sendiri saat W2-03 mendaftarkan rutenya.
 * Kartu /produk/* dirender dari `produk[].slug` (content/site.ts), rutenya literal
 * dan sudah hidup, jadi tidak lewat penyaring.
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
    // `images` sengaja TIDAK disetel: gambarnya datang dari app/opengraph-image.tsx
    // (konvensi berkas Next), dan Next hanya menyisipkannya bila key `images`
    // tidak ada di sini. Alasan lengkap + rujukan baris kode Next ada di
    // components/sections/metadata-halaman.ts.
  },
};

/**
 * Angka & label bukti berasal dari `bukti[]` (content/site.ts); kalimat penjelas
 * dari `beranda.bukti.detail`. Pasangannya ditentukan `kunci`, BUKAN posisi array
 * (G-24): urutan baris di content/site.ts hanya mengatur urutan tayang, jadi
 * menukarnya tidak bisa lagi memindahkan paragraf ke angka yang salah.
 *
 * Tidak ada penjagaan `undefined` di sini karena tidak bisa ada: `detail` bertipe
 * `Record<KunciBukti, string>` yang total terhadap `bukti[]`, jadi butir tanpa
 * kalimat ditolak `tsc`/`next build` jauh sebelum halaman ini dirender.
 */
const daftarBukti = bukti.map((item) => ({
  kunci: item.kunci,
  angka: item.angka,
  label: item.label,
  detail: beranda.bukti.detail[item.kunci],
}));

// "Lihat Portofolio Kami": ke /studi-kasus bila rutenya sudah hidup (content/rute.ts),
// selama belum — jangkar ke section rekam jejak di halaman ini (W2-03).
const hrefPortofolio = ruteHidup(beranda.hero.portofolio.href)
  ? beranda.hero.portofolio.href
  : beranda.hero.portofolio.hrefSementara;
const tautanBukti = tautanHidup(beranda.bukti.tautan);
const penutupSekunder = tautanHidup(beranda.penutup.sekunder);

/** Ikon chip kartu produk per slug. `Record<SlugProduk, …>`: produk baru tanpa ikon = build gagal. */
const IKON_PRODUK: Record<SlugProduk, NamaIkon> = {
  "bima-insight": "data",
  odoo: "database",
  "web-apps": "code",
};

const kelasJudulSection = "mt-5 max-w-[22ch] font-display text-3xl font-extrabold sm:text-4xl";
const kelasParagrafSection = "mt-4 max-w-[65ch] text-ink-2";
const kelasBarisTombol = "mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center";

export default function Home() {
  return (
    <>
      {/* ---------- Hero ----------
          Foto developer (Unsplash, Arif Riyanto — lihat ADR 2026-09-24) + selubung
          gelap + ikon bidang kerja. `.tema-gelap` membuat blok ini selalu bertema
          gelap agar teks di atas foto terbaca di light maupun dark mode. */}
      <section aria-labelledby="judul-hero" className="tema-gelap relative isolate overflow-hidden bg-bg">
        <Image
          src="/hero/beranda-developer.jpg"
          alt=""
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover object-[70%_45%]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-selubung-rata lg:bg-selubung-foto" />
        {/* Efek referensi v0 (G-29): blob aksen berdenyut + cahaya pengikut kursor. */}
        <BlobLatar />
        <CahayaKursor />
        <IkonTeknologiMelayang />

        {/* Isi hero muncul bertahap (muncul-naik + jeda 0/100/200/300/400 ms);
            semuanya `motion-safe:` — pengunjung reduced-motion langsung melihat utuh. */}
        <div className={kelas(wadah, "relative py-16 sm:py-24 lg:py-28")}>
          <IkonTeknologiDeret />
          {/* Badge pill (pola referensi) menggantikan eyebrow bergaris khusus di hero.
              Teks: copy + lokasi dari content/site.ts. */}
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent motion-safe:animate-muncul-naik">
            <IkonBidang nama="kilau" className="h-4 w-4 shrink-0" />
            {/* Lokasi hanya disambung bila diisi — `site.location` boleh kosong. */}
            <span>{[beranda.hero.eyebrow, site.location].filter(Boolean).join(" · ")}</span>
          </p>
          <h1
            id="judul-hero"
            className="mt-6 max-w-[20ch] text-4xl font-extrabold text-ink sm:text-5xl lg:text-6xl motion-safe:animate-muncul-naik motion-safe:[animation-delay:100ms]"
          >
            <JudulSorot judul={beranda.hero.judul} sorot={beranda.hero.judulSorot} />
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg text-ink-2 motion-safe:animate-muncul-naik motion-safe:[animation-delay:200ms]">
            {beranda.hero.teks}
          </p>
          <div
            className={kelas(
              kelasBarisTombol,
              "motion-safe:animate-muncul-naik motion-safe:[animation-delay:300ms]",
            )}
          >
            <WaButton pesan={beranda.hero.primer.pesan} panah>
              {beranda.hero.primer.label}
            </WaButton>
            <LinkButton href={hrefPortofolio}>{beranda.hero.portofolio.label}</LinkButton>
          </div>

          {/* Statistik dari `statistik[]` (content/site.ts). <dt> ditulis lebih dulu
              demi semantik, angka ditampilkan di atas lewat flex-col-reverse. Titik
              berdenyut = pola referensi, dekoratif. */}
          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-line pt-8 sm:gap-8 motion-safe:animate-muncul-naik motion-safe:[animation-delay:400ms]">
            {statistik.map((item, i) => (
              <div key={item.kunci} className="flex flex-col-reverse gap-1">
                <dt className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-2 sm:text-xs">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent motion-safe:animate-pulse"
                    style={{ animationDelay: `${i * 500}ms` }}
                  />
                  {item.label}
                </dt>
                <dd className="font-display text-2xl font-extrabold text-ink sm:text-4xl">{item.angka}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Pita gradien merek di tepi bawah hero. */}
        <div aria-hidden="true" className="h-1.5 bg-gradien" />
      </section>

      {/* ---------- Tiga lini produk ---------- */}
      <section aria-labelledby="judul-produk" className="relative isolate overflow-hidden">
        <BlobLatar posisi="kanan-atas" />
        <div className={kelas(wadah, "py-16 sm:py-20")}>
        <Eyebrow>{beranda.produk.eyebrow}</Eyebrow>
        <h2 id="judul-produk" className={kelasJudulSection}>
          {beranda.produk.judul}
        </h2>
        {beranda.produk.teks ? <p className={kelasParagrafSection}>{beranda.produk.teks}</p> : null}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produk.map((item) => {
            // Paket pertama = paket masuk untuk lini ini. Harga TIDAK PERNAH
            // diketik di komponen, selalu dari content/site.ts.
            // Anotasi `Paket | undefined` disengaja: `produk[]` kini `as const`, jadi
            // tanpa anotasi tipe elemennya menyempit ke objek literal per paket dan
            // `satuan` (opsional, tidak ada di semua paket) hilang dari union.
            const paketMasuk: Paket | undefined = item.paket.at(0);
            return (
              <li key={item.slug} className="muncul-saat-gulir flex">
                <Link
                  href={`/produk/${item.slug}`}
                  className={kelas(
                    "group flex w-full flex-col rounded-2xl border border-line bg-surface/80 p-6 backdrop-blur-sm",
                    kartuInteraktif,
                    fokusRing,
                  )}
                >
                  <span className={kelas(chipIkon, "mb-5 self-start")}>
                    <IkonBidang nama={IKON_PRODUK[item.slug]} />
                  </span>
                  <h3 className="flex items-start justify-between gap-3 font-display text-xl font-bold text-ink group-hover:text-accent motion-safe:transition-colors">
                    {item.nama}
                    <span
                      aria-hidden="true"
                      className="text-muted group-hover:text-accent motion-safe:transition motion-safe:group-hover:translate-x-1"
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
        </div>
      </section>

      {/* ---------- Bukti / rekam jejak ---------- */}
      {/* id="rekam-jejak" = tujuan sementara tombol "Lihat Portofolio Kami" di hero;
          scroll-mt memberi ruang untuk header sticky (h-20 + pita). */}
      <section
        id="rekam-jejak"
        aria-labelledby="judul-bukti"
        className={kelas(wadah, "scroll-mt-24 py-16 sm:py-20")}
      >
        <Eyebrow>{beranda.bukti.kepala.eyebrow}</Eyebrow>
        <h2 id="judul-bukti" className={kelasJudulSection}>
          {beranda.bukti.kepala.judul}
        </h2>
        {beranda.bukti.kepala.teks ? (
          <p className={kelasParagrafSection}>{beranda.bukti.kepala.teks}</p>
        ) : null}

        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {daftarBukti.map((item) => (
            <li key={item.kunci} className="muncul-saat-gulir border-t border-line pt-5">
              <h3 className="font-display text-2xl font-extrabold text-ink">{item.angka}</h3>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                {item.label}
              </p>
              <p className="mt-4 max-w-[65ch] text-sm text-ink-2">{item.detail}</p>
            </li>
          ))}
        </ul>

        {tautanBukti ? (
          <p className="mt-10">
            <Link href={tautanBukti.href} className={tautanTeks}>
              {tautanBukti.label}
            </Link>
          </p>
        ) : null}
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

          {/* Kartu proses (pola referensi v0): nomor besar bergradien di pojok,
              dekoratif karena urutan sudah disampaikan <ol>. Kartu berlatar `bg`
              karena section ini pita surface. */}
          <ol className="mt-10 grid gap-4 sm:grid-cols-2">
            {beranda.caraKerja.langkah.map((langkah) => (
              <li
                key={langkah.nomor}
                className={kelas(
                  "muncul-saat-gulir group relative overflow-hidden rounded-2xl border border-line bg-bg p-6 pt-16",
                  kartuInteraktif,
                )}
              >
                <span aria-hidden="true" className={nomorBesar}>
                  {langkah.nomor}
                </span>
                <h3 className="relative max-w-[18ch] font-display text-xl font-bold text-ink group-hover:text-accent motion-safe:transition-colors">
                  {langkah.judul}
                </h3>
                <p className="relative mt-3 max-w-[65ch] text-sm text-ink-2">{langkah.teks}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Penutup / CTA ---------- */}
      <section aria-labelledby="judul-penutup" className={kelas(wadah, "py-16 sm:py-24")}>
        <div className="muncul-saat-gulir relative isolate overflow-hidden rounded-3xl border border-line bg-surface">
          <BlobLatar posisi="kanan-atas" />
          {/* Pita gradien di tepi atas kartu — sama dengan <BlokCtaPenutup>. */}
          <div aria-hidden="true" className="h-1.5 bg-gradien" />
          <div className="p-8 sm:p-12">
            <Eyebrow>{beranda.penutup.eyebrow}</Eyebrow>
            <h2 id="judul-penutup" className={kelasJudulSection}>
              {beranda.penutup.judul}
            </h2>
            <p className={kelasParagrafSection}>{beranda.penutup.teks}</p>
            <div className={kelasBarisTombol}>
              <WaButton pesan={beranda.penutup.primer.pesan} panah>
                {beranda.penutup.primer.label}
              </WaButton>
              {penutupSekunder ? (
                <LinkButton href={penutupSekunder.href}>{penutupSekunder.label}</LinkButton>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
