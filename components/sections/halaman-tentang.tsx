import Link from "next/link";
import { kartuInteraktif, kelas, tautanTeks } from "@/components/styles";
import type { TentangCopy } from "@/content/copy";
import { tautanHidup } from "@/content/rute";
import { BlokCtaPenutup } from "./blok-cta-penutup";
import { BlokParagraf } from "./blok-paragraf";
import { DaftarBukti } from "./daftar-bukti";
import { DaftarMesin } from "./daftar-mesin";
import { DaftarPoin } from "./daftar-poin";
import { HeroHalaman } from "./hero-halaman";
import { KepalaSection } from "./kepala-section";
import { SectionHalaman } from "./section-halaman";
import { propsReveal } from "@/components/reveal";

/**
 * Susunan lengkap halaman /tentang.
 *
 * Teks: `copy` (content/copy/tentang.ts) — dirender terhadap tipe `TentangCopy`,
 * bukan terhadap nilai literalnya. Angka bukti, nama perusahaan, dan lokasi berasal
 * dari content/site.ts (lewat <DaftarBukti> dan komponen bersama). Tidak ada satu pun
 * kalimat, angka, nomor WhatsApp, atau alamat email yang diketik di file ini.
 *
 * Urutan section mengikuti urutan field pada `TentangCopy`: hero > visi & misi > siapa >
 * mesin > prinsip > rekam jejak > penutup. Latar `surface` dipasang berselang agar
 * irama visualnya sama dengan halaman produk dan /pricing; section yang isinya kartu
 * `bg-surface` (prinsip, lewat <DaftarPoin>) sengaja jatuh di latar `bg` supaya
 * kartunya tidak menyatu dengan pita latar.
 *
 * `copy.rekamJejak.tautan` dilewatkan `tautanHidup()` (content/rute.ts), penyaring
 * yang sama dengan nav, footer, dan halaman lain: selama /studi-kasus belum ada
 * (W2-03) tautannya tidak dirender, dan menyala sendiri begitu rutenya didaftarkan
 * di berkas itu — tanpa menyunting komponen ini lagi. Sectionnya tetap berisi kepala
 * + tiga angka bukti, jadi tidak pernah jadi judul kosong.
 */

const ID_JUDUL = {
  hero: "judul-utama",
  visiMisi: "judul-visi-misi",
  siapa: "judul-siapa",
  mesin: "judul-mesin",
  prinsip: "judul-prinsip",
  rekamJejak: "judul-rekam-jejak",
  penutup: "judul-penutup",
} as const;

export function HalamanTentang({ copy }: { copy: TentangCopy }) {
  const tautanRekamJejak = tautanHidup(copy.rekamJejak.tautan);
  const idJudulVisiMisi = copy.visiMisi.map((_, i) => `${ID_JUDUL.visiMisi}-${i + 1}`);

  return (
    <>
      <HeroHalaman hero={copy.hero} idJudul={ID_JUDUL.hero} />

      {/* Visi & misi: section tanpa kepala. Judul kartu ("Visi"/"Misi") menjadi
          <h2> agar outline tetap h1 → h2, dan nama aksesibel section-nya
          gabungan keduanya (aria-labelledby menerima beberapa id). Kartu berlatar
          `bg`, bukan `bg-surface` (<DaftarPoin>), karena berada di pita surface. */}
      <SectionHalaman idJudul={idJudulVisiMisi.join(" ")} latar="surface">
        <ul className="grid gap-4 sm:grid-cols-2">
          {copy.visiMisi.map((item, i) => (
            <li
              key={item.judul}
              {...propsReveal(i)}
              className={kelas("rounded-2xl border border-line bg-bg p-6", kartuInteraktif)}
            >
              <h2 id={idJudulVisiMisi[i]} className="font-display text-2xl font-extrabold text-ink">
                {item.judul}
              </h2>
              <p className="mt-3 max-w-[65ch] text-ink-2">{item.teks}</p>
            </li>
          ))}
        </ul>
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.siapa}>
        <KepalaSection kepala={copy.siapa.kepala} idJudul={ID_JUDUL.siapa} />
        <BlokParagraf paragraf={copy.siapa.paragraf} />
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.mesin} latar="surface">
        <KepalaSection kepala={copy.mesin.kepala} idJudul={ID_JUDUL.mesin} />
        <DaftarMesin item={copy.mesin.item} />
        {/* Catatan penutup section: kotak accent-soft, pola yang sama dengan
            `catatan` pada <HeroHalaman> — bukan kartu `bg-surface`, supaya tetap
            terbaca sebagai catatan di atas pita latar surface ini. */}
        <p className="mt-10 max-w-[65ch] rounded-xl border border-line bg-accent-soft px-5 py-4 text-sm text-ink-2">
          {copy.mesin.catatan}
        </p>
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.prinsip}>
        <KepalaSection kepala={copy.prinsip.kepala} idJudul={ID_JUDUL.prinsip} />
        <DaftarPoin poin={copy.prinsip.poin} />
      </SectionHalaman>

      {/* Rekam jejak: kepala section + angka bukti dari content/site.ts. Tautan
          `copy.rekamJejak.tautan` hanya tayang bila rutenya terdaftar hidup di
          content/rute.ts — bentuk tautannya sama dengan tautan bukti di beranda. */}
      <SectionHalaman idJudul={ID_JUDUL.rekamJejak} latar="surface">
        <KepalaSection kepala={copy.rekamJejak.kepala} idJudul={ID_JUDUL.rekamJejak} />
        <DaftarBukti />
        {tautanRekamJejak ? (
          <p className="mt-10">
            <Link href={tautanRekamJejak.href} className={tautanTeks}>
              {tautanRekamJejak.label}
            </Link>
          </p>
        ) : null}
      </SectionHalaman>

      <BlokCtaPenutup cta={copy.penutup} idJudul={ID_JUDUL.penutup} />
    </>
  );
}
