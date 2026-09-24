import { WaButton } from "@/components/wa-button";
import type { JalurKontak } from "@/content/copy";
import { site } from "@/content/site";

/**
 * Daftar jalur kontak (`kontak.jalur.item`). Server component.
 *
 * Nilai tiap jalur diambil dari `content/site.ts` lewat field `nilaiDari` pada
 * copy — komponen ini tidak mengetik ulang satu pun nomor, alamat, atau kota.
 *
 * ATURAN YANG MEMBATASI APA YANG BOLEH TERBIT KE HTML:
 * 1. **Alamat email tidak pernah dirender**, baik sebagai teks maupun `mailto:`
 *    (ADR 2026-08-24 di docs/decisions.md — alamat resmi BCT saat ini adalah
 *    alamat pribadi owner, jadi tidak boleh dipanen bot spam). Karena jalur email
 *    tanpa alamat DAN tanpa tombol hanya menyisakan judul buntu, seluruh entrinya
 *    tidak dirender. Copy dan tipenya dibiarkan utuh di content/copy/kontak.ts —
 *    begitu owner menyediakan alamat khusus publik (mis. halo@domain), entri ini
 *    tinggal dinyalakan kembali di sini tanpa mengubah satu kata pun copy.
 * 2. **Digit nomor WhatsApp juga tidak dirender sebagai teks** — polanya sama
 *    dengan `components/site-footer.tsx`. Jalurnya hanya lewat tombol `waLink()`.
 */

/**
 * Nilai yang BOLEH terbit ke HTML untuk tiap `nilaiDari`.
 * `null` = ada datanya di content/site.ts, tapi sengaja tidak ditampilkan.
 */
const nilaiTampil: Record<JalurKontak["nilaiDari"], string | null> = {
  whatsappNumber: null, // aturan 2 — nomornya hanya hidup di dalam waLink()
  email: null, // aturan 1
  location: site.location,
};

export function DaftarJalurKontak({ item }: { item: JalurKontak[] }) {
  // Kartu lokasi hanya tayang bila `site.location` diisi: kartu "Lokasi" tanpa
  // lokasinya menyesatkan. Owner mengosongkan nilai itu per 2026-09-25.
  const tampil = item.filter(
    (jalur) => jalur.nilaiDari !== "email" && !(jalur.nilaiDari === "location" && !site.location),
  );

  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2">
      {tampil.map((jalur) => {
        const nilai = nilaiTampil[jalur.nilaiDari];
        return (
          <li key={jalur.id} className="rounded-2xl border border-line p-6">
            <h3 className="font-display text-lg font-bold text-ink">{jalur.label}</h3>
            <p className="mt-3 max-w-[65ch] text-sm text-ink-2">{jalur.teks}</p>
            {nilai ? (
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-ink-2">
                {nilai}
              </p>
            ) : null}
            {/* Tombol hanya untuk jalur yang punya `aksi` DAN `pesan` prefill —
                praktisnya: WhatsApp. Syarat `pesan` bukan kerapian belaka, ia
                pagar: jalur beraksi non-WhatsApp (mis. email) tidak akan pernah
                diam-diam ikut terender oleh <WaButton>. */}
            {jalur.aksi && jalur.pesan ? (
              <WaButton pesan={jalur.pesan} varian="sekunder" className="mt-5">
                {jalur.aksi}
              </WaButton>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
