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
 * `tentang.rekamJejak.tautan` (label "Buka studi kasus" -> /studi-kasus) SENGAJA
 * TIDAK DIRENDER: rute /studi-kasus belum ada, jadi merender tautannya = mengirim
 * pengunjung ke 404 tepat di section yang seharusnya membangun kepercayaan. Aturan
 * yang sama dipakai W2-02/W2-09: di dalam <main> hanya rute yang hidup. Copy dan
 * tipenya dibiarkan utuh di content/copy/tentang.ts (bukan sampah) — begitu halaman
 * studi kasus tayang, tautan tinggal dinyalakan kembali di <HalamanTentang> tanpa
 * mengubah satu kata pun copy. Dilaporkan ke lead sebagai temuan W2-04.
 */
export const metadata: Metadata = metadataHalaman(tentang.meta, "/tentang");

export default function HalamanProfilBct() {
  return <HalamanTentang copy={tentang} />;
}
