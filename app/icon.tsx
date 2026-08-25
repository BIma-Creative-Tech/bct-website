import { ImageResponse } from "next/og";
import { fontDisplay } from "@/components/og";
import { site } from "@/content/site";

/**
 * Favicon situs (rute /icon, terbit sebagai <link rel="icon">).
 *
 * Sebelum berkas ini ada, /favicon.ico membalas 404 di SEMUA rute dan setiap
 * pemuatan halaman menyisakan satu error di konsol browser (diukur qa-reviewer
 * 2026-08-25, W3-01).
 *
 * Kenapa dirender kode, bukan berkas .ico/.png statis: mark-nya jadi turunan dari
 * sumber kebenaran yang sama dengan situsnya — huruf dari `site.shortName`
 * (content/site.ts) dengan font display resmi, warna = token app/globals.css.
 * Tidak ada aset biner buram yang harus dipercaya begitu saja. Next melarang
 * `favicon` dirender kode ("You cannot generate a favicon icon", dokumen
 * app-icons.md), jadi konvensi yang dipakai `icon`, bukan `favicon`.
 *
 * Warna ditulis hex karena satori tidak membaca CSS — nilainya wajib identik
 * dengan :root light di app/globals.css (alasan lengkap di
 * components/og/kartu-og.tsx). Latar accent + huruf warna --bg dipilih supaya
 * mark tetap terbaca di tab browser terang maupun gelap; kebalikannya
 * (accent di atas ink) hanya 2,9:1.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#96660f", // --accent
          color: "#f6f5f1", // --bg
          borderRadius: 6,
          fontFamily: "Bricolage Grotesque",
          fontSize: 24,
        }}
      >
        {/* Huruf pertama singkatan merek — "BCT" tidak terbaca pada 32 piksel. */}
        {site.shortName.slice(0, 1)}
      </div>
    ),
    { ...size, fonts: [await fontDisplay()] },
  );
}
