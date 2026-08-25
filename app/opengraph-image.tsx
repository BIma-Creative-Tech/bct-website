import { altOg, kartuOg, tipeKontenOg, ukuranOg } from "@/components/og";
import { beranda } from "@/content/copy";

/**
 * Kartu Open Graph beranda. Tampilannya di components/og/kartu-og.tsx; berkas ini
 * hanya memilih copy-nya, sama tipisnya dengan page.tsx di sebelahnya.
 *
 * Berkas ini berada di SEGMEN ROOT, jadi ia juga menjadi og:image untuk
 * /_not-found (app/not-found.tsx satu segmen dengan layout root). Konsekuensinya
 * kartu share halaman 404 memuat judul beranda, bukan judul 404 — diterima
 * sadar: halaman 404 ber-`noindex` dan tidak pernah dibagikan dengan sengaja,
 * dan kartu bermerek lebih baik daripada tidak ada gambar sama sekali. Ia TIDAK
 * menurun ke /pricing, /tentang, /kontak, atau /produk/* — alasannya (dengan
 * rujukan baris kode Next) ada di kepala components/og/kartu-og.tsx.
 */
export const alt = altOg(beranda.meta);
export const size = ukuranOg;
export const contentType = tipeKontenOg;

export default async function Image() {
  return kartuOg(beranda.meta);
}
