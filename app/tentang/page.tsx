import type { Metadata } from "next";
import { HalamanTentang, metadataHalaman } from "@/components/sections";
import { tentang } from "@/content/copy";

/**
 * /tentang — profil BCT: posisi, siapa yang mengerjakan, tiga mesin bisnis,
 * prinsip operasi, dan rekam jejak.
 *
 * Copy: content/copy/tentang.ts · angka bukti, nama, dan lokasi: content/site.ts.
 * Struktur section-nya di <HalamanTentang> (components/sections/halaman-tentang.tsx).
 *
 * `tentang.rekamJejak.tautan` (label "Buka studi kasus" -> /studi-kasus) tidak
 * tayang selama rute /studi-kasus belum ada: merender tautannya = mengirim
 * pengunjung ke 404 tepat di section yang seharusnya membangun kepercayaan. Sejak
 * W2-12 penjagaannya tidak lagi ditulis tangan di sini melainkan lewat
 * `tautanHidup()` (content/rute.ts) di dalam <HalamanTentang> — penyaring yang
 * sama dipakai nav, footer, dan halaman lain. Copy dan tipenya tetap utuh di
 * content/copy/tentang.ts; menambahkan "/studi-kasus" ke daftar di content/rute.ts
 * saat W2-03 selesai sudah cukup untuk menyalakannya kembali.
 */
export const metadata: Metadata = metadataHalaman(tentang.meta, "/tentang");

export default function HalamanProfilBct() {
  return <HalamanTentang copy={tentang} />;
}
