/**
 * Memecah teks angka dari content/site.ts (`statistik[].angka`, `bukti[].angka`) menjadi nilai
 * numerik + akhiran, untuk <NumberTicker> (G-39). Angka TIDAK pernah dikarang: nilainya selalu
 * diturunkan dari teks sumber, dan teks non-angka ("KOMDIGI", "Retail") → null (tampil apa adanya).
 *
 *   "30+"       → { nilai: 30, akhiran: "+" }
 *   "10+ tahun" → { nilai: 10, akhiran: "+ tahun" }
 *   "KOMDIGI"   → null
 */
export function pecahAngka(teks: string): { nilai: number; akhiran: string } | null {
  const cocok = /^(\d{1,9})(\D.*)?$/.exec(teks.trim());
  if (!cocok) return null;
  return { nilai: Number(cocok[1]), akhiran: cocok[2] ?? "" };
}
