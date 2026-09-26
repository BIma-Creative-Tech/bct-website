/**
 * IP klien untuk rate limit `/api/lead`, di belakang Traefik (satu-satunya ingress; pola
 * web-starter `src/lib/client-ip.ts`, ADR 2026-09-26).
 *
 * KENAPA ENTRI X-Forwarded-For PALING KANAN BISA DIPERCAYA DI SINI:
 * - Entrypoint Traefik platform TIDAK menyetel `forwardedHeaders.trustedIPs`/`insecure`
 *   (/opt/infra/traefik/traefik.yml: "tidak ada proxy di depan Traefik"). Dalam mode itu
 *   Traefik MEMBUANG `X-Forwarded-*`/`X-Real-Ip` kiriman klien, lalu menulis ulang
 *   `X-Forwarded-For` dan `X-Real-Ip` dengan alamat soket peer yang sebenarnya.
 * - Container tidak punya port publik (compose template: hanya network `web-edge`), jadi
 *   setiap permintaan yang sampai ke sini sudah melewati Traefik. Entri paling kanan =
 *   yang ditambahkan hop terdekat (Traefik) → tidak bisa dikarang klien. Entri kiri
 *   (bila ada proxy lain yang meneruskan apa adanya) bisa dipalsukan, jadi tidak dipakai.
 * - Sisa risiko yang diterima platform: website lain di network `web-edge` bisa menjangkau
 *   :3000 langsung dan mengarang header (docs infra traefik.md §Network web-edge).
 *
 * SYARAT OPERASIONAL: image ini TIDAK BOLEH diterbitkan dengan port publik tanpa Traefik
 * di depannya — tanpa hop tepercaya, header ini ditulis klien dan penyerang bisa memilih
 * ember rate limit-nya sendiri (terbukti audit G-05: 20.000 IP palsu lolos). Compose lokal
 * di repo ini hanya bind ke 127.0.0.1.
 *
 * Mengembalikan `null` bila tidak ada IP yang sah (pemanggil jatuh ke ember global).
 */
const IP_RE = /^[0-9a-fA-F:.]{2,45}$/;

export function clientIpFrom(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    // Hanya entri PALING KANAN yang dinilai: bila tidak sah, JANGAN mundur ke entri kiri.
    const last = xff.split(",").at(-1)?.trim();
    return last && IP_RE.test(last) ? last : null;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real && IP_RE.test(real)) return real;
  return null;
}
