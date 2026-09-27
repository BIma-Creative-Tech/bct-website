import { NumberTicker } from "@/components/ui-21st/number-ticker";
import { pecahAngka } from "@/lib/angka";

/**
 * Teks angka dari content/site.ts dengan Number Ticker (G-39): bagian numeriknya dihitung naik
 * saat terlihat (<ScrollEnhancer>), akhirannya ("+", "+ tahun") statis. Server merender NILAI
 * AKHIR (tanpa JS / crawler / reduced motion melihat angka benar). Teks non-angka → apa adanya.
 */
export function AngkaStatistik({ teks, urutan = 0 }: { teks: string; urutan?: number }) {
  const angka = pecahAngka(teks);
  if (!angka) return <>{teks}</>;
  return (
    <>
      <NumberTicker value={angka.nilai} delay={urutan * 0.1} className="tracking-normal" />
      {angka.akhiran}
    </>
  );
}
