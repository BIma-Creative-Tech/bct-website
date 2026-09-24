import { ImageResponse } from "next/og";
import type { MetaCopy } from "@/content/copy";
import { produk, site } from "@/content/site";
import { fontKartuOg } from "./fonts";

/**
 * Kartu Open Graph 1200x630 — satu tampilan untuk seluruh situs, isinya berbeda
 * per halaman. Dipakai berkas `opengraph-image.tsx` di tiap segmen rute hidup.
 *
 * TEKSNYA TIDAK DIKARANG DI SINI. Judul dan deskripsi datang dari `meta` milik
 * halaman (content/copy/<halaman>.ts) — string yang sama persis dengan <title>,
 * og:title, dan meta description-nya. Nama merek, tiga nama lini produk, dan
 * lokasi datang dari content/site.ts. Berkas ini tidak menyimpan satu kalimat pun.
 *
 * KENAPA SATU BERKAS opengraph-image.tsx PER SEGMEN, bukan satu di root saja:
 * saat sebuah halaman mengekspor `openGraph` sendiri (semua halaman kita, lewat
 * `metadataHalaman()`), resolver metadata Next MENIMPA `openGraph` warisan induk
 * — lihat `mergeMetadata` case 'openGraph' di
 * node_modules/next/dist/lib/metadata/resolve-metadata.js:182. Gambar statis baru
 * ditambahkan kembali oleh `mergeStaticMetadata` (baris 149) dan hanya dari
 * staticFilesMetadata SEGMEN ITU SENDIRI. Jadi kartu di root tidak akan pernah
 * sampai ke /pricing atau /produk/*: tiap segmen harus punya berkasnya sendiri.
 * Syarat lain dari baris 149 yang harus dijaga: `metadataHalaman()` TIDAK boleh
 * menyetel `openGraph.images` — begitu key itu ada, gambar berkas diabaikan.
 *
 * WARNA: satori tidak membaca CSS, jadi token app/globals.css tidak bisa dipakai
 * lewat kelas Tailwind dan nilainya terpaksa ditulis sebagai hex di sini. Ini
 * SATU-SATUNYA tempat hex diizinkan (lihat CLAUDE.md > Design system). Nilainya
 * wajib identik dengan blok `:root` LIGHT di app/globals.css; gambar OG tidak
 * punya dark mode, jadi hanya varian terang yang relevan.
 */
const warna = {
  bg: "#fffbd5", // --bg
  ink: "#191813", // --ink
  ink2: "#54524c", // --ink-2
  accent: "#b20a2c", // --accent
  gradien: "linear-gradient(to right, #b20a2c, #fffbd5)", // --gradien
} as const;

/** Ukuran kartu OG (1200x630 = rasio yang diminta Facebook/X/WhatsApp). */
export const ukuranOg = { width: 1200, height: 630 };

export const tipeKontenOg = "image/png";

/**
 * Teks `alt` gambar (terbit sebagai og:image:alt). Sengaja identik dengan
 * og:title halaman: gambarnya memang berisi kalimat itu, jadi alt-nya jujur.
 */
export function altOg(meta: MetaCopy): string {
  return `${meta.title} — ${site.name}`;
}

/** "Bima Insight · Odoo ERP · Web & Apps" — nama lini produk dari content/site.ts. */
const lingkupKerja = produk.map((item) => item.nama).join(" · ");

export async function kartuOg(meta: MetaCopy): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: warna.bg,
          color: warna.ink,
          padding: "72px 80px",
          fontFamily: "Figtree",
        }}
      >
        {/* Eyebrow: garis pendek accent di kiri + mono uppercase ber-tracking,
            bentuk yang sama dengan <Eyebrow> di components/eyebrow.tsx. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", width: 56, height: 3, backgroundColor: warna.accent }} />
          <div
            style={{
              display: "flex",
              marginLeft: 20,
              fontFamily: "IBM Plex Mono",
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: warna.accent,
            }}
          >
            {site.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage Grotesque",
              fontSize: 76,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            {meta.title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.45,
              color: warna.ink2,
              maxWidth: 900,
            }}
          >
            {meta.description}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Pita gradien merek, sama dengan pita di header/hero situs. */}
          <div style={{ display: "flex", width: "100%", height: 6, borderRadius: 3, backgroundImage: warna.gradien }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 26,
              fontFamily: "IBM Plex Mono",
              fontSize: 22,
              letterSpacing: 1,
              color: warna.ink2,
            }}
          >
            <div style={{ display: "flex" }}>{lingkupKerja}</div>
            <div style={{ display: "flex" }}>{site.location}</div>
          </div>
        </div>
      </div>
    ),
    { ...ukuranOg, fonts: await fontKartuOg() },
  );
}
