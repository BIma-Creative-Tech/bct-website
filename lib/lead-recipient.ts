import "server-only";

/**
 * Penerima email lead `/api/lead` (keputusan owner 2026-09-26, G-41).
 *
 * SERVER-ONLY: `import "server-only"` membuat build gagal bila berkas ini (langsung atau lewat
 * rantai impor) masuk client component. ADR 2026-08-24 melarang alamat email BCT/owner terbit
 * ke HTML atau chunk klien; `scripts/check-pii.mjs` membaca literal di bawah dan memfailkan
 * build bila alamatnya muncul di `.next/static/**` atau prerender. Bentuk baris
 * `export const PENERIMA_LEAD = "…";` dibaca skrip itu dengan regex — jangan diubah bentuknya.
 */
export const PENERIMA_LEAD = "info@bimacreative.tech";
