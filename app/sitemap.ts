import type { MetadataRoute } from "next";
import { RUTE_HIDUP } from "@/content/rute";
import { site } from "@/content/site";

/**
 * /sitemap.xml
 *
 * DAFTAR RUTENYA TIDAK DITULIS DI SINI. Ia dibaca dari `RUTE_HIDUP`
 * (content/rute.ts) — daftar yang sama yang menyalakan nav, footer, dan tautan
 * dalam halaman. Dua daftar rute berarti salah satunya pasti basi: sitemap yang
 * memuat rute belum jadi mengundang crawler ke 404, dan rute baru yang lupa
 * didaftarkan tidak akan pernah ditemukan. Menghidupkan /studi-kasus (W2-03) atau
 * /insight (W2-06) tetap satu baris di content/rute.ts, sitemap ikut sendiri.
 *
 * `lastModified`, `changeFrequency`, dan `priority` SENGAJA TIDAK DIISI.
 * Ketiganya opsional (hanya <loc> yang wajib menurut protokol sitemaps.org), dan
 * tidak ada satu pun yang bisa kita isi dengan jujur:
 * - `lastModified`: repo ini tidak menyimpan tanggal ubah per halaman. Satu-satunya
 *   nilai yang tersedia saat build adalah waktu build, yang berarti mengklaim
 *   KETUJUH halaman berubah setiap kali situs di-deploy — persis sinyal yang
 *   membuat crawler berhenti mempercayai lastmod. Lebih baik tidak ada daripada
 *   salah. Kalau kelak /insight (MDX) masuk, artikel punya tanggal sungguhan dan
 *   boleh mengisinya; halaman statis tetap tidak.
 * - `changeFrequency` & `priority`: nilai deklaratif tanpa dasar terukur; mesin
 *   pencari besar mengabaikannya. Menambahkannya = tabel angka karangan yang
 *   harus dirawat setiap kali halaman bertambah.
 *
 * Domain diambil dari `site.domain`. Selama nilainya masih "http://localhost:3000"
 * (sementara, sampai W3-04 mengisi domain produksi) sitemap ini memuat URL
 * localhost — itu memang keadaan sebenarnya, bukan yang boleh ditambal di sini.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return RUTE_HIDUP.map((path) => ({ url: urlKanonik(path) }));
}

/**
 * Bentuk URL absolut yang PERSIS SAMA dengan <link rel="canonical"> terbitan Next
 * untuk rute yang sama. Next menerbitkan beranda tanpa garis miring penutup
 * ("http://localhost:3000"), sedangkan `new URL("/", ...)` menghasilkan versi
 * bergaris miring; membiarkan keduanya berbeda berarti sitemap dan canonical
 * menunjuk dua URL yang tidak identik untuk halaman yang sama.
 */
function urlKanonik(path: string): string {
  const url = new URL(path, site.domain);
  return url.pathname === "/" ? url.href.replace(/\/+$/, "") : url.href;
}
