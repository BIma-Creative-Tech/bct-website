/**
 * SATU-SATUNYA daftar rute internal yang sudah HIDUP di situs ini.
 *
 * ATURAN (W2-12): situs tidak pernah menautkan rute yang belum ada — di nav, di
 * footer, maupun di dalam <main>. Tautan mati membuang pengunjung ke 404 dan
 * membuat prefetch RSC Next menerbitkan error 404 di konsol setiap halaman.
 *
 * CARA MENGHIDUPKAN RUTE BARU: tambahkan path-nya ke `RUTE_HIDUP` di bawah —
 * SATU baris, SATU berkas. Nav, footer, hero, CTA penutup, dan tautan di dalam
 * halaman langsung ikut menyala karena semuanya menyaring lewat `saringTautan()`
 * / `tautanHidup()`. Jangan lagi menambal per-komponen dan jangan menghapus
 * entri dari `content/copy/*`: copy-nya sudah benar, yang belum ada halamannya.
 *
 * Rute yang sengaja BELUM terdaftar (halamannya belum dibuat):
 * - `/studi-kasus` -> W2-03
 * - `/insight`     -> W2-06
 * - `/rate-card-bct.pdf` -> W2-11 (berkas di public/, bukan rute app/ — daftarkan
 *   di sini juga saat berkasnya masuk, aturannya sama: jangan menautkan yang belum ada)
 *
 * Modul ini sengaja bebas React dan bebas teks: dipakai komponen server MAUPUN
 * client (`components/site-nav.tsx`), jadi tidak boleh menarik apa pun ke bundel.
 */

export const RUTE_HIDUP = [
  "/",
  "/produk/bima-insight",
  "/produk/odoo",
  "/produk/web-apps",
  "/pricing",
  "/tentang",
  "/kontak",
] as const;

const daftarRute: ReadonlySet<string> = new Set(RUTE_HIDUP);

/**
 * `true` bila `href` boleh dirender.
 *
 * Tautan non-internal (http(s), mailto, tel, anchor `#`) dilewatkan apa adanya:
 * aturan ini hanya menjaga rute milik situs sendiri. Query string dan fragment
 * dipangkas dulu supaya `/pricing#faq` tetap dikenali sebagai `/pricing`.
 */
export function ruteHidup(href: string): boolean {
  if (!href.startsWith("/")) return true;
  const jalur = href.split(/[?#]/, 1)[0];
  if (jalur === "" || jalur === "/") return daftarRute.has("/");
  return daftarRute.has(jalur.replace(/\/+$/, ""));
}

/** Saring daftar tautan copy (nav, footer, grid) — sisakan yang rutenya hidup. */
export function saringTautan<T extends { href: string }>(tautan: readonly T[]): T[] {
  return tautan.filter((item) => ruteHidup(item.href));
}

/**
 * Versi satuan dari `saringTautan()` untuk tautan opsional (hero.sekunder,
 * penutup.sekunder, dst). Mengembalikan `undefined` bila rutenya belum hidup,
 * sehingga pemanggil cukup memakai ternary yang sudah ada.
 */
export function tautanHidup<T extends { href: string }>(tautan: T | undefined): T | undefined {
  return tautan && ruteHidup(tautan.href) ? tautan : undefined;
}
