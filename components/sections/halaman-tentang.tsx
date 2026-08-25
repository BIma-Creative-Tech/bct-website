import Link from "next/link";
import { tautanTeks } from "@/components/styles";
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

/**
 * Susunan lengkap halaman /tentang.
 *
 * Teks: `copy` (content/copy/tentang.ts) — dirender terhadap tipe `TentangCopy`,
 * bukan terhadap nilai literalnya. Angka bukti, nama perusahaan, dan lokasi berasal
 * dari content/site.ts (lewat <DaftarBukti> dan komponen bersama). Tidak ada satu pun
 * kalimat, angka, nomor WhatsApp, atau alamat email yang diketik di file ini.
 *
 * Urutan section mengikuti urutan field pada `TentangCopy`: hero > posisi > siapa >
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
  posisi: "judul-posisi",
  siapa: "judul-siapa",
  mesin: "judul-mesin",
  prinsip: "judul-prinsip",
  rekamJejak: "judul-rekam-jejak",
  penutup: "judul-penutup",
} as const;

export function HalamanTentang({ copy }: { copy: TentangCopy }) {
  const tautanRekamJejak = tautanHidup(copy.rekamJejak.tautan);

  return (
    <>
      <HeroHalaman hero={copy.hero} idJudul={ID_JUDUL.hero} />

      <SectionHalaman idJudul={ID_JUDUL.posisi} latar="surface">
        <KepalaSection kepala={copy.posisi.kepala} idJudul={ID_JUDUL.posisi} />
        <BlokParagraf paragraf={copy.posisi.paragraf} />
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
