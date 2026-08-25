import { BATAS_ISIAN } from "@/app/api/lead/batas";
import { WaButton } from "@/components/wa-button";
import type { FormKontakCopy, KontakCopy } from "@/content/copy";
import { BlokCtaPenutup } from "./blok-cta-penutup";
import { FormKontak } from "./form-kontak";
import { HeroHalaman } from "./hero-halaman";
import { DaftarJalurKontak } from "./jalur-kontak";
import { KepalaSection } from "./kepala-section";
import { SectionHalaman } from "./section-halaman";

/**
 * Susunan lengkap halaman /kontak: hero → jalur kontak → form → penutup,
 * mengikuti urutan field pada `KontakCopy`.
 *
 * Teks: `copy` (content/copy/kontak.ts). Nomor WhatsApp dan lokasi: content/site.ts.
 * Tidak ada satu pun kalimat, nomor, atau alamat yang diketik di sini.
 *
 * Hanya <FormKontak> yang client component; sisa halaman dirender di server.
 * `copy.form` dioper sebagai prop supaya client bundle tidak ikut menarik seluruh
 * barrel `@/content/copy` (copy seluruh situs) ke browser.
 *
 * Alasan yang sama berlaku untuk `tombolWa` di bawah: <WaButton> dirender DI SINI,
 * lalu elemen hasilnya yang menyeberang. Kalau <FormKontak> yang mengimpornya,
 * `content/site.ts` ikut UTUH ke bundel klien — `email`, `domain`, `location`,
 * `tagline` — di chunk bersama yang dimuat setiap rute, bukan cuma /kontak.
 * Aturannya lengkap di aturan 7 pada kepala components/sections/form-kontak.tsx.
 *
 * Berkas ini juga SENGAJA tidak diekspor lewat components/sections/index.ts: barrel
 * itu diimpor enam halaman tanpa form, dan mengekspor komponen yang menyentuh batas
 * klien membuat chunk form ikut dimuat di keenamnya. /kontak mengimpornya langsung.
 *
 * IRAMA LATAR: jalur di pita `surface` dengan kartu bergaris tanpa isian warna
 * (kartu `bg-surface` akan menyatu dengan pitanya), sedangkan form di latar `bg`
 * supaya kontrol `bg-surface` punya kontras terhadap latarnya. Sama seperti
 * /pricing dan /tentang.
 */

/** Tiga pesan validasi satu isian teks (tipe `ValidasiTeks` di content/copy). */
type PesanValidasi = FormKontakCopy["validasiLokal"]["nama"];

/** "2000" → "2.000". Dijalankan di server saat build, jadi hasilnya tetap. */
const angkaId = new Intl.NumberFormat("id-ID");

/**
 * Isi token `{maks}` pada pesan validasi dengan batas dari skema route.
 *
 * DILAKUKAN DI SISI SERVER, sebelum copy menyeberang ke client component. Kalau
 * penggantian dikerjakan di browser, `{maks}` yang masih mentah ikut terbit ke
 * HTML sebagai muatan RSC — token template yang tidak seharusnya pernah sampai ke
 * perangkat pengunjung (dan tinggal selangkah dari terbaca mata bila kode berubah).
 * Terverifikasi pada HTML hasil build: nol kemunculan "{maks}".
 *
 * Berlaku untuk SEMUA pesan, bukan hanya `pesan.terlaluPanjang` yang memakainya
 * hari ini — tiap isian diisi dengan batas miliknya sendiri.
 */
function isiBatas(pesan: PesanValidasi, maks: number): PesanValidasi {
  const ganti = (teks: string) => teks.replaceAll("{maks}", angkaId.format(maks));
  return {
    kosong: ganti(pesan.kosong),
    terlaluPendek: ganti(pesan.terlaluPendek),
    terlaluPanjang: ganti(pesan.terlaluPanjang),
  };
}

function copyFormSiapPakai(copy: FormKontakCopy): FormKontakCopy {
  const v = copy.validasiLokal;
  return {
    ...copy,
    validasiLokal: {
      ...v,
      nama: isiBatas(v.nama, BATAS_ISIAN.nama.maks),
      kontak: isiBatas(v.kontak, BATAS_ISIAN.kontak.maks),
      pesan: isiBatas(v.pesan, BATAS_ISIAN.pesan.maks),
    },
  };
}

const ID_JUDUL = {
  hero: "judul-utama",
  jalur: "judul-jalur",
  form: "judul-form",
  penutup: "judul-penutup",
} as const;

export function HalamanKontak({ copy }: { copy: KontakCopy }) {
  return (
    <>
      <HeroHalaman hero={copy.hero} idJudul={ID_JUDUL.hero} />

      <SectionHalaman idJudul={ID_JUDUL.jalur} latar="surface">
        <KepalaSection kepala={copy.jalur.kepala} idJudul={ID_JUDUL.jalur} />
        <DaftarJalurKontak item={copy.jalur.item} />
      </SectionHalaman>

      <SectionHalaman idJudul={ID_JUDUL.form}>
        <KepalaSection kepala={copy.form.kepala} idJudul={ID_JUDUL.form} />
        {/* CTA WhatsApp untuk kotak hasil pengiriman dan untuk <noscript> di dalam
            form — label & pesan prefill yang sudah ada di copy (CTA penutup halaman
            ini), bukan teks baru karangan komponen. Dirender di sini, di server;
            lihat catatan `tombolWa` di kepala berkas. */}
        <FormKontak
          copy={copyFormSiapPakai(copy.form)}
          tombolWa={
            <WaButton pesan={copy.penutup.primer.pesan} varian="sekunder">
              {copy.penutup.primer.label}
            </WaButton>
          }
        />
      </SectionHalaman>

      <BlokCtaPenutup cta={copy.penutup} idJudul={ID_JUDUL.penutup} />
    </>
  );
}
