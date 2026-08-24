import { produk } from "@/content/site";
import { DaftarPaket } from "./daftar-paket";

/**
 * Seluruh paket ketiga lini produk, DIKELOMPOKKAN per produk — bentuk yang dibutuhkan
 * /pricing (halaman produk hanya menampilkan paket miliknya sendiri lewat <DaftarPaket>).
 *
 * Sumber tunggal: `produk[]` di content/site.ts. Nama lini, kalimat ringkas, nama paket,
 * harga, satuan, fitur, dan pesan prefill WhatsApp semuanya dibaca dari sana; komponen ini
 * tidak mengetik satu pun angka harga, nama paket, atau nomor WhatsApp. Menambah produk
 * atau paket di content/site.ts otomatis tayang di sini tanpa menyentuh komponen.
 *
 * Struktur: <ul> produk > <li> (judul lini + ringkas) > <ul> kartu paket. Daftar bersarang
 * dipakai supaya "paket ini milik produk yang mana" tersampaikan ke pembaca layar tanpa
 * menambah landmark <section> bertumpuk. Nama paket karena itu diturunkan ke <h4>.
 *
 * TIDAK ADA tautan "lihat detail" ke /produk/*: teks tombol/tautan harus berasal dari
 * content/copy, dan `PricingCopy` tidak menyediakan label untuk itu. Mengarang labelnya
 * dilarang (CLAUDE.md > Bahasa & suara). Rute produk tetap terjangkau lewat nav situs.
 */
export function PaketPerProduk({ labelCta }: { labelCta: string }) {
  return (
    <ul className="mt-10 space-y-14">
      {produk.map((item) => (
        <li key={item.slug} className="border-t border-line pt-6">
          <h3 className="font-display text-2xl font-extrabold text-ink">{item.nama}</h3>
          <p className="mt-2 max-w-[65ch] text-sm text-ink-2">{item.ringkas}</p>
          <DaftarPaket
            paket={item.paket}
            labelCta={labelCta}
            levelJudul="h4"
            className="mt-6"
          />
        </li>
      ))}
    </ul>
  );
}
