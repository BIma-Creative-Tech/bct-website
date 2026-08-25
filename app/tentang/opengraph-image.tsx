import { altOg, kartuOg, tipeKontenOg, ukuranOg } from "@/components/og";
import { tentang } from "@/content/copy";

/**
 * Kartu Open Graph /tentang. Tampilannya dipakai bersama seluruh situs di
 * components/og/kartu-og.tsx; berkas ini hanya memilih copy-nya.
 *
 * Wajib ada per segmen: kartu di segmen root TIDAK menurun ke sini karena
 * halaman ini mengekspor `openGraph` sendiri lewat `metadataHalaman()`.
 * Alasan lengkap + rujukan baris kode Next ada di components/og/kartu-og.tsx.
 */
export const alt = altOg(tentang.meta);
export const size = ukuranOg;
export const contentType = tipeKontenOg;

export default async function Image() {
  return kartuOg(tentang.meta);
}
