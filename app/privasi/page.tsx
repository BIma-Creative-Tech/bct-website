import type { Metadata } from "next";
import { HalamanPrivasi, metadataHalaman } from "@/components/sections";
import { privasi } from "@/content/copy";

/**
 * /privasi — kebijakan privasi situs (G-48, permintaan owner Q11): form kontak, Turnstile
 * (bila aktif), analitik Umami, dan jalur pertanyaan soal data.
 *
 * Copy: content/copy/privasi.ts · susunan: components/sections/halaman-privasi.tsx.
 * Rute terdaftar di content/rute.ts (RUTE_HIDUP) → sitemap, footer, dan tautan catatan
 * privasi /kontak ikut menyala dari sana.
 */
export const metadata: Metadata = metadataHalaman(privasi.meta, "/privasi");

export default function KebijakanPrivasi() {
  return <HalamanPrivasi copy={privasi} />;
}
