import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ImageResponse } from "next/og";

/**
 * Font untuk gambar yang dirender `next/og` (OG image + favicon).
 *
 * KENAPA BERKAS .ttf SENDIRI, bukan next/font/google yang sudah dipakai layout?
 * `ImageResponse` merender lewat satori, dan satori butuh data font mentah
 * (ttf/otf/woff). next/font/google menghasilkan .woff2 — format yang TIDAK
 * didukung: `grep -c woff2` pada node_modules/next/dist/compiled/@vercel/og/
 * index.node.js = 0, dan bundel itu tidak membawa dekompresor brotli. Jadi tidak
 * ada jalan memakai ulang berkas font milik next/font; .ttf harus disediakan.
 *
 * Satu-satunya alternatif tanpa berkas lokal adalah mengunduh font dari Google
 * saat build. Ditolak: ia mengubah setiap `next build` (termasuk stage `build` di
 * Dockerfile dan job CI) jadi bergantung pada respons jaringan yang tidak
 * di-cache, demi aset yang isinya tidak pernah berubah.
 *
 * Berkasnya ada di assets/fonts/ (BUKAN public/): ia hanya dibaca saat build dan
 * tidak boleh ikut dilayani ke pengunjung. Lisensi + sumber unduhannya tercatat
 * di assets/fonts/LICENSE.txt (ketiganya SIL OFL 1.1, yang mewajibkan teks
 * lisensi ikut didistribusikan).
 *
 * NAMA KELUARGA FONT di bawah harus persis sama dengan yang dirujuk
 * `fontFamily` di components/og/kartu-og.tsx dan app/icon.tsx — satori mencocokkan
 * font berdasarkan string ini, dan font yang tidak cocok gagal DIAM-DIAM
 * (huruf jatuh ke font lain, bukan error).
 */
type FontOg = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]>[number];

const DIR_FONT = join(process.cwd(), "assets", "fonts");

/**
 * Dibaca sekali per proses lalu ditahan di memori: `next build` merender tujuh OG
 * image plus favicon, dan tanpa memo ini berkas yang sama dibaca berulang kali.
 * Promise-nya (bukan hasilnya) yang di-cache supaya dua render paralel dalam satu
 * worker berbagi pembacaan yang sama.
 */
const cache = new Map<string, Promise<Buffer>>();

function bacaFont(berkas: string): Promise<Buffer> {
  const tersimpan = cache.get(berkas);
  if (tersimpan) return tersimpan;
  const janji = readFile(join(DIR_FONT, berkas));
  cache.set(berkas, janji);
  return janji;
}

/** Bricolage Grotesque 800 — font display (judul, huruf pada favicon). */
export async function fontDisplay(): Promise<FontOg> {
  return {
    name: "Bricolage Grotesque",
    data: await bacaFont("BricolageGrotesque-ExtraBold.ttf"),
    weight: 800,
    style: "normal",
  };
}

/** Figtree 400 — font body (deskripsi). */
export async function fontBody(): Promise<FontOg> {
  return {
    name: "Figtree",
    data: await bacaFont("Figtree-Regular.ttf"),
    weight: 400,
    style: "normal",
  };
}

/** IBM Plex Mono 500 — font label kecil (eyebrow, kaki kartu). */
export async function fontMono(): Promise<FontOg> {
  return {
    name: "IBM Plex Mono",
    data: await bacaFont("IBMPlexMono-Medium.ttf"),
    weight: 500,
    style: "normal",
  };
}

/** Ketiga font untuk kartu OG. */
export function fontKartuOg(): Promise<FontOg[]> {
  return Promise.all([fontDisplay(), fontBody(), fontMono()]);
}
