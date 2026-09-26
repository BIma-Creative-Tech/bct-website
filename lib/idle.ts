/**
 * Jalankan `cb` saat browser idle (setelah first paint/hydration), dengan fallback setTimeout
 * untuk browser tanpa requestIdleCallback (Safari). Mengembalikan fungsi pembatal.
 * Dipakai untuk menunda kerja non-kritis (animasi intro, ikon, reveal) keluar dari jendela
 * Total Blocking Time.
 */
export function onIdle(cb: () => void, timeout = 1500): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}
