import { kelas, wadah } from "@/components/styles";
import type { PrivasiCopy } from "@/content/copy";
import { BlokCtaPenutup } from "./blok-cta-penutup";
import { BlokParagraf } from "./blok-paragraf";
import { DaftarTanda } from "./daftar-tanda";
import { HeroHalaman } from "./hero-halaman";
import { KepalaSection } from "./kepala-section";
import { SectionHalaman } from "./section-halaman";

/**
 * Susunan halaman /privasi (G-48).
 *
 * Teks: `copy` (content/copy/privasi.ts). Tidak ada kalimat, alamat email, atau nomor WhatsApp
 * yang diketik di sini — jalur pertanyaan soal data = <BlokCtaPenutup> (WhatsApp lewat waLink()
 * + tautan /kontak yang disaring `tautanHidup()`), bukan alamat email (ADR 2026-08-24).
 *
 * Urutan: hero > tanggal pembaruan > bagian[] (latar berselang bg/surface) > atribusi GeoLite2
 * (hanya bila `atribusiGeoLite2.tampil`) > pertanyaan soal data.
 */

const ID_JUDUL = {
  hero: "judul-utama",
  kontak: "judul-pertanyaan-data",
} as const;

export function HalamanPrivasi({ copy }: { copy: PrivasiCopy }) {
  return (
    <>
      <HeroHalaman hero={copy.hero} idJudul={ID_JUDUL.hero} />

      <div className={kelas(wadah, "-mt-4")}>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {copy.diperbarui.label} <time dateTime={copy.diperbarui.iso}>{copy.diperbarui.tanggal}</time>
        </p>
      </div>

      {copy.bagian.map((bagian, i) => {
        const idJudul = `judul-${bagian.id}`;
        return (
          <SectionHalaman key={bagian.id} idJudul={idJudul} latar={i % 2 === 1 ? "surface" : "bg"}>
            <KepalaSection kepala={bagian.kepala} idJudul={idJudul} />
            <BlokParagraf paragraf={bagian.paragraf} />
            {bagian.daftar ? <DaftarTanda item={bagian.daftar} className="mt-6" /> : null}
            {bagian.paragrafAkhir ? <BlokParagraf paragraf={bagian.paragrafAkhir} className="mt-6" /> : null}
          </SectionHalaman>
        );
      })}

      {copy.atribusiGeoLite2.tampil ? (
        <div className={wadah}>
          <p className="max-w-[65ch] text-xs text-muted">{copy.atribusiGeoLite2.teks}</p>
        </div>
      ) : null}

      <BlokCtaPenutup cta={copy.kontak} idJudul={ID_JUDUL.kontak} />
    </>
  );
}
