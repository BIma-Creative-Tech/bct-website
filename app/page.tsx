import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AngkaStatistik } from "@/components/angka-statistik";
import { BlobLatar } from "@/components/blob-latar";
import { CahayaKursor } from "@/components/cahaya-kursor";
import { Eyebrow } from "@/components/eyebrow";
import { HeroAnimator } from "@/components/hero-animator";
import { Icon } from "@/components/icon";
import {
  IkonBidang,
  IkonTeknologiDeret,
  IkonTeknologiMelayang,
  type NamaIkon,
} from "@/components/ikon-teknologi";
import { JudulSorot } from "@/components/judul-sorot";
import { LinkButton } from "@/components/link-button";
import { propsReveal } from "@/components/reveal";
import { BlokCtaPenutup, DaftarBukti } from "@/components/sections";
import { MarqueePauseButton } from "@/components/sections/marquee-pause-button";
import { kartuInteraktif, kelas, nomorBesar, tautanTeks, wadah } from "@/components/styles";
import { AnimatedGridPattern } from "@/components/ui-21st/animated-grid-pattern";
import { BentoCard, BentoGrid } from "@/components/ui-21st/bento-grid";
import { Marquee } from "@/components/ui-21st/marquee";
import { WaButton } from "@/components/wa-button";
import { beranda } from "@/content/copy";
import { ruteHidup, tautanHidup } from "@/content/rute";
import { produk, site, statistik, type Paket, type SlugProduk } from "@/content/site";

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

// "Lihat Portofolio Kami": ke /studi-kasus bila rutenya sudah hidup (content/rute.ts),
// selama belum — jangkar ke section rekam jejak di halaman ini (W2-03).
const hrefPortofolio = ruteHidup(beranda.hero.portofolio.href)
  ? beranda.hero.portofolio.href
  : beranda.hero.portofolio.hrefSementara;
const tautanBukti = tautanHidup(beranda.bukti.tautan);

/** Ikon chip kartu produk per slug. `Record<SlugProduk, …>`: produk baru tanpa ikon = build gagal. */
const IKON_PRODUK: Record<SlugProduk, NamaIkon> = {
  "bima-insight": "dasbor",
  odoo: "database",
  "web-apps": "code",
};

const kelasJudulSection = "mt-5 max-w-[22ch] font-display text-3xl font-extrabold sm:text-4xl";
const kelasParagrafSection = "mt-4 max-w-[65ch] text-ink-2";
const kelasBarisTombol = "mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center";

/**
 * Tata letak bento produk (lg: 3 kolom): kartu pertama tinggi di kiri (2 baris), dua kartu
 * lain melebar di kanan. Indeks, bukan slug, agar produk keempat tetap mendapat sel wajar.
 */
const SEL_BENTO = ["lg:row-span-2", "lg:col-span-2", "md:col-span-2"];

/** Latar dekoratif kartu bento — hanya token aksen-lembut (satu aksen merah). */
const LATAR_BENTO = [
  "bg-[radial-gradient(circle_at_85%_0%,var(--accent-soft),transparent_60%)]",
  "bg-[radial-gradient(circle_at_100%_100%,var(--accent-soft),transparent_55%)]",
  "bg-[linear-gradient(135deg,var(--accent-soft),transparent_55%)]",
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero ----------
          Foto developer (Unsplash, Arif Riyanto — lihat ADR 2026-09-24) + selubung
          gelap + ikon bidang kerja. `.tema-gelap` membuat blok ini selalu bertema
          gelap agar teks di atas foto terbaca di light maupun dark mode.
          Intro (G-38): <HeroAnimator> anime.js (WAAPI, saat idle) — teks TIDAK pernah
          disembunyikan (LCP = paint pertama); baris `data-hero-init="lift"` diberi gerak
          angkat bertahap. Grid (G-39, 21st.dev Animated Grid Pattern) di atas selubung,
          dimask ke sisi kanan (area foto) agar tidak mengganggu teks; kotak berkedip hanya md+. */}
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
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.18}
          duration={3}
          animateMedia="(min-width: 768px)"
          className="-z-10 opacity-50 mask-[radial-gradient(640px_circle_at_85%_35%,white,transparent)]"
        />
        <CahayaKursor />
        <IkonTeknologiMelayang />

        <HeroAnimator className={kelas(wadah, "relative py-16 sm:py-24 lg:py-28")}>
          <IkonTeknologiDeret />
          {/* Badge pill (pola referensi) menggantikan eyebrow bergaris khusus di hero.
              Teks: copy + lokasi dari content/site.ts. */}
          <p
            data-hero-init="lift"
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent"
          >
            <IkonBidang nama="kilau" size={16} />
            {/* Lokasi hanya disambung bila diisi — `site.location` boleh kosong. */}
            <span>{[beranda.hero.eyebrow, site.location].filter(Boolean).join(" · ")}</span>
          </p>
          <h1
            id="judul-hero"
            data-hero-init="lift"
            className="mt-6 max-w-[20ch] text-4xl font-extrabold text-ink sm:text-5xl lg:text-6xl"
          >
            <JudulSorot judul={beranda.hero.judul} sorot={beranda.hero.judulSorot} />
          </h1>
          <p data-hero-init="lift" className="mt-6 max-w-[58ch] text-lg text-ink-2">
            {beranda.hero.teks}
          </p>
          <div data-hero-init="lift" className={kelasBarisTombol}>
            <WaButton pesan={beranda.hero.primer.pesan} panah>
              {beranda.hero.primer.label}
            </WaButton>
            <LinkButton href={hrefPortofolio}>{beranda.hero.portofolio.label}</LinkButton>
          </div>

          {/* Statistik dari `statistik[]` (content/site.ts), angka lewat Number Ticker
              (21st.dev, G-39): server merender nilai akhir; hitung naik hanya bila baris ini
              masih di bawah layar saat idle (mis. HP) — yang sudah terlihat tidak diubah.
              <dt> ditulis lebih dulu demi semantik, angka tampil di atas (flex-col-reverse). */}
          <dl
            data-hero-init="lift"
            className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-line pt-8 sm:gap-8"
          >
            {statistik.map((item, i) => (
              <div key={item.kunci} className="flex flex-col-reverse gap-1">
                <dt className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-2 sm:text-xs">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item.label}
                </dt>
                <dd className="font-display text-2xl font-extrabold text-ink sm:text-4xl">
                  <AngkaStatistik teks={item.angka} urutan={i} />
                </dd>
              </div>
            ))}
          </dl>
        </HeroAnimator>

        {/* Pita gradien merek di tepi bawah hero. */}
        <div aria-hidden="true" className="h-1.5 bg-gradien" />
      </section>

      {/* ---------- Pita teknologi (Marquee 21st.dev, G-39) ----------
          Isi = teknologi yang sudah disebut copy produk (content/copy/beranda.ts). Jeda:
          tombol (WCAG 2.2.2), hover, dan fokus; reduced motion → diam, satu salinan, bisa
          digulir. Server component; hanya tombol jeda yang client. */}
      <section aria-labelledby="judul-teknologi" className="border-b border-line bg-surface">
        <div className={kelas(wadah, "flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:gap-6")}>
          <h2
            id="judul-teknologi"
            className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-2"
          >
            {beranda.teknologi.label}
          </h2>
          <div
            id="pita-teknologi"
            className="relative min-w-0 flex-1 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] motion-reduce:[mask-image:none]"
          >
            <Marquee pauseOnHover repeat={4} durasi={30}>
              <ul className="flex shrink-0 gap-(--gap)">
                {beranda.teknologi.item.map((nama) => (
                  <li
                    key={nama}
                    className="whitespace-nowrap rounded-full border border-line bg-bg px-4 py-1.5 font-mono text-xs text-ink"
                  >
                    {nama}
                  </li>
                ))}
              </ul>
            </Marquee>
          </div>
          <MarqueePauseButton
            targetId="pita-teknologi"
            labelJeda={beranda.teknologi.jeda}
            labelPutar={beranda.teknologi.putar}
          />
        </div>
      </section>

      {/* ---------- Tiga lini produk: Bento Grid (21st.dev, G-39) ---------- */}
      <section aria-labelledby="judul-produk" className="relative isolate overflow-hidden">
        <BlobLatar posisi="kanan-atas" />
        <div className={kelas(wadah, "py-16 sm:py-20")}>
          <Eyebrow>{beranda.produk.eyebrow}</Eyebrow>
          <h2 id="judul-produk" className={kelasJudulSection}>
            {beranda.produk.judul}
          </h2>
          {beranda.produk.teks ? <p className={kelasParagrafSection}>{beranda.produk.teks}</p> : null}

          <BentoGrid className="mt-10 lg:auto-rows-[minmax(13rem,auto)]">
            {produk.map((item, i) => {
              // Paket pertama = paket masuk untuk lini ini. Harga TIDAK PERNAH
              // diketik di komponen, selalu dari content/site.ts.
              // Anotasi `Paket | undefined` disengaja: `produk[]` kini `as const`, jadi
              // tanpa anotasi tipe elemennya menyempit ke objek literal per paket dan
              // `satuan` (opsional, tidak ada di semua paket) hilang dari union.
              const paketMasuk: Paket | undefined = item.paket.at(0);
              return (
                <BentoCard
                  key={item.slug}
                  href={`/produk/${item.slug}`}
                  nama={item.nama}
                  deskripsi={item.ringkas}
                  className={SEL_BENTO[i] ?? ""}
                  liProps={propsReveal(i)}
                  ikon={<IkonBidang nama={IKON_PRODUK[item.slug]} type="bulk" />}
                  latar={<div className={kelas("absolute inset-0", LATAR_BENTO[i % LATAR_BENTO.length])} />}
                  panah={
                    <Icon
                      name="arrow-right-01"
                      size={20}
                      className="mt-1 text-muted group-hover:text-accent motion-safe:transition motion-safe:group-hover:translate-x-1"
                    />
                  }
                >
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
                </BentoCard>
              );
            })}
          </BentoGrid>
        </div>
      </section>

      {/* ---------- Bukti / rekam jejak ---------- */}
      {/* id="rekam-jejak" = tujuan sementara tombol "Lihat Portofolio Kami" di hero;
          scroll-mt memberi ruang untuk header sticky (h-20 + pita). Angka + kalimat penjelas
          lewat <DaftarBukti detail> — komponen yang sama dengan /tentang (pasangan `kunci`, G-24). */}
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

        <DaftarBukti detail={beranda.bukti.detail} />

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
            {beranda.caraKerja.langkah.map((langkah, i) => (
              <li
                key={langkah.nomor}
                {...propsReveal(i)}
                className={kelas(
                  "group relative overflow-hidden rounded-2xl border border-line bg-bg p-6 pt-16",
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

      {/* ---------- Penutup / CTA ----------
          Sama persis dengan halaman lain: <BlokCtaPenutup> (tautan sekunder disaring
          `tautanHidup()` di dalamnya). */}
      <BlokCtaPenutup cta={beranda.penutup} idJudul="judul-penutup" />
    </>
  );
}
