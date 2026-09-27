import { AngkaStatistik } from "@/components/angka-statistik";
import { propsReveal } from "@/components/reveal";
import { bukti, type KunciBukti } from "@/content/site";

/**
 * Angka rekam jejak BCT, dibaca langsung dari `bukti[]` di content/site.ts —
 * satu-satunya sumbernya. Komponen ini tidak mengetik ulang angka maupun labelnya,
 * jadi menambah/mengubah bukti cukup dilakukan di content/site.ts.
 *
 * Dipakai beranda DAN /tentang (G-39: satu komponen). Beranda mengirim `detail`
 * (`beranda.bukti.detail`, dipasangkan lewat `kunci` — G-24); di /tentang kalimat itu tidak
 * tersedia di copy, dan mengarang penggantinya dilarang (CLAUDE.md > Bahasa & suara), jadi di
 * sana hanya angka + label yang tayang.
 *
 * Tanpa `detail` angka dirender sebagai <p> (statistik, bukan judul bagian); dengan `detail`
 * sebagai <h3> karena ada paragraf di bawahnya — outline heading tetap h1 > h2 > h3.
 * Bagian numerik ("10+ tahun") memakai Number Ticker; "KOMDIGI"/"Retail" tampil apa adanya.
 */
export function DaftarBukti({ detail }: { detail?: Record<KunciBukti, string> }) {
  const Angka = detail ? "h3" : "p";
  return (
    <ul className="mt-10 grid gap-8 sm:grid-cols-3">
      {bukti.map((item, i) => (
        <li key={item.kunci} {...propsReveal(i)} className="border-t border-line pt-5">
          <Angka className="font-display text-2xl font-extrabold text-ink">
            <AngkaStatistik teks={item.angka} urutan={i} />
          </Angka>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">{item.label}</p>
          {detail ? <p className="mt-4 max-w-[65ch] text-sm text-ink-2">{detail[item.kunci]}</p> : null}
        </li>
      ))}
    </ul>
  );
}
