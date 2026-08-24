import { bukti } from "@/content/site";

/**
 * Angka rekam jejak BCT, dibaca langsung dari `bukti[]` di content/site.ts —
 * satu-satunya sumbernya. Komponen ini tidak mengetik ulang angka maupun labelnya,
 * jadi menambah/mengubah bukti cukup dilakukan di content/site.ts.
 *
 * Beranda menampilkan varian yang sama PLUS kalimat penjelas dari
 * `beranda.bukti.detail[]`; di /tentang kalimat itu tidak tersedia di copy, dan
 * mengarang penggantinya dilarang (CLAUDE.md > Bahasa & suara). Jadi di sini hanya
 * angka + label yang tayang.
 *
 * Angka dirender sebagai <p>, bukan <h3>: nilainya statistik, bukan judul bagian
 * yang punya isi di bawahnya — outline heading halaman tetap h1 > h2 > h3.
 */
export function DaftarBukti() {
  return (
    <ul className="mt-10 grid gap-8 sm:grid-cols-3">
      {bukti.map((item) => (
        <li key={item.label} className="border-t border-line pt-5">
          <p className="font-display text-2xl font-extrabold text-ink">{item.angka}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {item.label}
          </p>
        </li>
      ))}
    </ul>
  );
}
