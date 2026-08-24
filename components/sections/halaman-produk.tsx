import type { ProdukCopy } from "@/content/copy";
import { produk } from "@/content/site";
import { BlokCtaPenutup } from "./blok-cta-penutup";
import { DaftarFaq } from "./daftar-faq";
import { DaftarLangkah } from "./daftar-langkah";
import { DaftarPaket } from "./daftar-paket";
import { DaftarPoin } from "./daftar-poin";
import { HeroHalaman } from "./hero-halaman";
import { KepalaSection } from "./kepala-section";
import { KolomUntukSiapa } from "./kolom-untuk-siapa";
import { SectionHalaman } from "./section-halaman";
import { BlokSectionTambahan } from "./section-tambahan";

/**
 * Susunan lengkap satu halaman produk.
 *
 * Ketiga rute /produk/* memakai komponen ini apa adanya, sehingga tidak ada satu
 * pun struktur section yang disalin-tempel tiga kali; page.tsx-nya hanya memilih
 * copy dan mengekspor metadata.
 *
 * Teks: `copy` (content/copy/<slug>.ts). Nama paket, harga, fitur, dan pesan
 * prefill WhatsApp: `produk[]` (content/site.ts), dicocokkan lewat slug. Tidak ada
 * kalimat, angka harga, atau nomor WhatsApp yang diketik di file ini.
 */

const ID_JUDUL = {
  hero: "judul-utama",
  masalah: "judul-masalah",
  caraKerja: "judul-cara-kerja",
  untukSiapa: "judul-untuk-siapa",
  paket: "judul-paket",
  faq: "judul-faq",
  penutup: "judul-penutup",
} as const;

export function HalamanProduk({ copy }: { copy: ProdukCopy }) {
  const data = produk.find((item) => item.slug === copy.slug);
  const tambahan = copy.tambahan ?? [];

  /**
   * Pita ber-latar `surface` dipasang berselang-seling mengikuti urutan section yang
   * benar-benar dirender, supaya irama visualnya tetap rapi walau jumlah section
   * tambahan berbeda-beda tiap produk.
   */
  const urutan = [
    "masalah",
    "cara-kerja",
    ...tambahan.map((item) => item.id),
    "untuk-siapa",
    "paket",
    "faq",
  ];
  const latar = (kunci: string): "bg" | "surface" =>
    urutan.indexOf(kunci) % 2 === 0 ? "surface" : "bg";

  return (
    <>
      {/* Eyebrow dibiarkan apa adanya dari copy. Menggabungkannya dengan
          `produk[].nama` sempat dicoba, tapi hasilnya mengulang kata untuk dua dari
          tiga produk ("Produk · ERP · Odoo ERP"), dan komponen tidak boleh mengarang
          teks pengganti. Tempat tayang nama produk = pertanyaan copy untuk owner. */}
      <HeroHalaman hero={copy.hero} idJudul={ID_JUDUL.hero} catatan={copy.catatanStatus} />

      <SectionHalaman idJudul={ID_JUDUL.masalah} latar={latar("masalah")}>
        <KepalaSection kepala={copy.masalah.kepala} idJudul={ID_JUDUL.masalah} />
        <DaftarPoin poin={copy.masalah.poin} />
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.caraKerja} latar={latar("cara-kerja")}>
        <KepalaSection kepala={copy.caraKerja.kepala} idJudul={ID_JUDUL.caraKerja} />
        <DaftarLangkah langkah={copy.caraKerja.langkah} />
      </SectionHalaman>

      {/* Section khas per produk; urutannya mengikuti urutan array di copy. */}
      {tambahan.map((item) => (
        <BlokSectionTambahan key={item.id} section={item} latar={latar(item.id)} />
      ))}

      <SectionHalaman idJudul={ID_JUDUL.untukSiapa} latar={latar("untuk-siapa")}>
        <KepalaSection kepala={copy.untukSiapa.kepala} idJudul={ID_JUDUL.untukSiapa} />
        <KolomUntukSiapa untukSiapa={copy.untukSiapa} />
      </SectionHalaman>

      {/* Blok harga hanya tayang bila slug-nya benar-benar ada di content/site.ts —
          lebih baik tidak menampilkan harga daripada menampilkan harga karangan. */}
      {data ? (
        <SectionHalaman idJudul={ID_JUDUL.paket} latar={latar("paket")}>
          <KepalaSection kepala={copy.paket} idJudul={ID_JUDUL.paket} />
          {/* Tipe `Paket` tidak punya label tombol, jadi labelnya diambil dari CTA
              penutup halaman ini — bukan teks baru karangan komponen. */}
          <DaftarPaket paket={data.paket} labelCta={copy.penutup.primer.label} />
        </SectionHalaman>
      ) : null}

      <SectionHalaman idJudul={ID_JUDUL.faq} latar={latar("faq")}>
        <KepalaSection kepala={copy.faq.kepala} idJudul={ID_JUDUL.faq} />
        <DaftarFaq item={copy.faq.item} />
      </SectionHalaman>

      <BlokCtaPenutup cta={copy.penutup} idJudul={ID_JUDUL.penutup} />
    </>
  );
}
