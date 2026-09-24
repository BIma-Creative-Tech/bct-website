/**
 * Dua blob aksen ber-blur di latar section (pola referensi v0, G-29). Dekoratif.
 *
 * Pemakai wajib memberi section-nya `relative isolate` (supaya `-z-10` di sini
 * tetap di belakang isi section, bukan di belakang halaman) dan `overflow-hidden`
 * bila tidak ingin blob meluber ke section tetangga. Denyutnya `motion-safe:` —
 * diam untuk prefers-reduced-motion.
 */
export function BlobLatar({ posisi = "kiri-atas" }: { posisi?: "kiri-atas" | "kanan-atas" }) {
  const blobA = posisi === "kiri-atas" ? "top-10 -left-16" : "top-10 -right-16";
  const blobB = posisi === "kiri-atas" ? "bottom-0 -right-24" : "bottom-0 -left-24";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        className={`absolute ${blobA} h-72 w-72 rounded-full bg-accent/10 blur-3xl motion-safe:animate-pulse [animation-duration:5s]`}
      />
      <div
        className={`absolute ${blobB} h-96 w-96 rounded-full bg-accent/5 blur-3xl motion-safe:animate-pulse [animation-delay:1s] [animation-duration:7s]`}
      />
    </div>
  );
}
