import type { Metadata } from "next";
import { metadataHalaman } from "@/components/sections";
import { HalamanKontak } from "@/components/sections/halaman-kontak";
import { kontak } from "@/content/copy";

/**
 * /kontak — jalur kontak + form lead yang mengirim ke `POST /api/lead`.
 *
 * Copy: content/copy/kontak.ts · nomor WhatsApp & lokasi: content/site.ts.
 * Struktur section-nya di <HalamanKontak> (components/sections/halaman-kontak.tsx),
 * diimpor LANGSUNG dari berkasnya dan bukan lewat barrel @/components/sections:
 * halaman ini satu-satunya yang punya form, dan barrel itu juga dipakai enam
 * halaman tanpa form. Alasan lengkapnya di kepala components/sections/index.ts.
 *
 * FORM SELALU DITAMPILKAN, termasuk selama `LEAD_WEBHOOK_URL` masih kosong
 * (keputusan owner 2026-08-25). Pada kondisi itu endpoint membalas 503 dan form
 * menampilkan `form.gagalBelumSiap` — pesan jujur yang mengarahkan pengunjung ke
 * WhatsApp, dengan isian dibiarkan utuh supaya tulisannya bisa disalin. Yang
 * DILARANG: menyembunyikan form, atau membuatnya seolah berhasil.
 *
 * Jalur "Email" pada `kontak.jalur.item` SENGAJA TIDAK DIRENDER — alasannya di
 * components/sections/jalur-kontak.tsx (ADR 2026-08-24: alamat email tidak pernah
 * terbit ke HTML). Dilaporkan ke lead sebagai temuan W2-05.
 */
export const metadata: Metadata = metadataHalaman(kontak.meta, "/kontak");

export default function HalamanHubungiBct() {
  return <HalamanKontak copy={kontak} />;
}
