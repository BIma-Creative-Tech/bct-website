/**
 * Barrel gambar yang dirender saat build oleh `next/og`.
 *
 * HANYA boleh diimpor berkas konvensi gambar Next (`opengraph-image.tsx`,
 * `icon.tsx`). Modul di folder ini membaca berkas font lewat `node:fs`, jadi ia
 * tidak boleh pernah tersentuh komponen klien — aturan yang sama dengan barrel
 * components/sections/index.ts, dengan alasan yang lebih keras: `node:fs` tidak
 * punya padanan di browser.
 */

export { fontBody, fontDisplay, fontMono, fontKartuOg } from "./fonts";
export { altOg, kartuOg, tipeKontenOg, ukuranOg } from "./kartu-og";
