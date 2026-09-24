import Link from "next/link";
import { footer, navCta } from "@/content/copy";
import { saringTautan } from "@/content/rute";
import { site } from "@/content/site";
import { fokusRing, kelas, wadah } from "./styles";
import { WaButton } from "./wa-button";

/**
 * Footer situs (server component).
 *
 * CATATAN TAUTAN (W2-12): footer memakai penyaring yang SAMA dengan nav dan
 * halaman — `saringTautan()` dari content/rute.ts. Hanya rute yang terdaftar
 * hidup di sana yang ditautkan; /studi-kasus (W2-03) dan /insight (W2-06) menyala
 * sendiri begitu path-nya ditambahkan di berkas itu. Data footer tetap utuh di
 * content/copy/umum.ts — jangan menghapus item dari copy.
 *
 * KEAMANAN: `site.email` dan digit nomor WhatsApp TIDAK pernah dirender sebagai
 * teks (hasil audit: email adalah alamat pribadi owner, jangan mudah di-scrape).
 * Satu-satunya jalur kontak di footer adalah tombol WhatsApp lewat waLink().
 */

/**
 * Grup yang seluruh tautannya menuju rute mati DIBUANG, bukan dirender sebagai
 * judul tanpa isi. Per 2026-08-26 tidak ada grup yang jatuh ke kondisi itu
 * (grup "Perusahaan" menyisakan Tentang, Harga, Kontak); penjagaannya dipasang
 * supaya penyaringan tidak pernah meninggalkan <h2> kosong di kemudian hari.
 */
const grupFooter = footer.grup
  .map((grup) => ({ judul: grup.judul, item: saringTautan(grup.item) }))
  .filter((grup) => grup.item.length > 0);

export function SiteFooter() {
  // Server component: dievaluasi saat build/render server, jadi tidak ada
  // perbedaan nilai antara HTML server dan hidrasi klien (hydration mismatch).
  const tahun = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      {/* pb ekstra = ruang aman supaya tombol WA mengambang (fixed, tinggi 56px +
          jarak 20px dari tepi bawah) tidak pernah menutupi baris terakhir footer. */}
      <div className={kelas(wadah, "pt-14 pb-28")}>
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight text-ink">
              <span aria-hidden="true" className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
              {site.name}
            </p>
            <p className="mt-4 max-w-[52ch] text-sm text-ink-2">{footer.ringkas}</p>
            {/* `site.location` boleh dikosongkan owner — jangan render <p> kosong. */}
            {site.location ? (
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                {site.location}
              </p>
            ) : null}
            {/* Label CTA memakai navCta dari content/copy/umum.ts — footer belum
                punya CTA sendiri di copy. */}
            <WaButton pesan={navCta.pesan} varian="sekunder" className="mt-6">
              {navCta.label}
            </WaButton>
          </div>

          {grupFooter.map((grup, indeks) => {
            const idJudul = `footer-grup-${indeks}`;
            return (
              <nav key={grup.judul} aria-labelledby={idJudul}>
                <h2
                  id={idJudul}
                  className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  {grup.judul}
                </h2>
                <ul className="mt-3">
                  {grup.item.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={kelas(
                          "inline-flex min-h-11 items-center rounded-sm text-sm text-ink-2 hover:text-accent motion-safe:transition-colors",
                          fokusRing,
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          {/* Disusun komponen: label + © + tahun + nama dari content/site.ts. */}
          <p>
            {footer.labelHakCipta} © {tahun} {site.name}
          </p>
          <p className="max-w-[65ch]">{footer.catatanHarga}</p>
        </div>
      </div>
    </footer>
  );
}
