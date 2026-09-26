/**
 * Judul dengan satu kata disorot warna aksen + coretan garis bawah yang "digambar"
 * dari kiri (pola referensi v0, G-29). Sejak G-38 coretannya digambar anime.js
 * (<HeroAnimator>, `scaleX` compositor) — bukan lagi `stroke-dashoffset` CSS (paint).
 *
 * Teks utuh tetap satu string dari copy; komponen hanya memecahnya di kemunculan
 * pertama `sorot`. Bila `sorot` tidak ada di `judul`, judul tampil polos — jadi
 * salah ketik di copy tidak pernah menghilangkan teks. Coretannya `aria-hidden`
 * dan animasinya hanya jalan tanpa prefers-reduced-motion (garis langsung utuh).
 */
export function JudulSorot({ judul, sorot }: { judul: string; sorot: string }) {
  const i = sorot ? judul.indexOf(sorot) : -1;
  if (i < 0) return <>{judul}</>;

  // Tanda baca yang menempel langsung setelah kata sorotan (mis. koma di "tahu,")
  // ikut dibungkus nowrap bersama kata itu. Tanpa ini peramban boleh memutus baris
  // di antara <span inline-block> dan komanya, sehingga baris berikutnya diawali ",".
  const sisa = judul.slice(i + sorot.length);
  const ekor = sisa.match(/^[^\s]*/)?.[0] ?? "";

  return (
    <>
      {judul.slice(0, i)}
      <span className="whitespace-nowrap">
      <span className="relative inline-block text-accent">
        {sorot}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 12"
          preserveAspectRatio="none"
          data-hero-init="underline"
          className="absolute -bottom-2 left-0 h-3 w-full origin-left"
          fill="none"
        >
          <path
            d="M2 10C50 5 150 5 198 10"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
      {ekor}
      </span>
      {sisa.slice(ekor.length)}
    </>
  );
}
