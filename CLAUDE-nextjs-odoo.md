@AGENTS.md

# nextjs-odoo — Frontend Next.js untuk Odoo 19 CE (produk BCT)

Frontend metadata-driven yang memperlakukan Odoo sebagai engine. Browser TIDAK pernah menyentuh Odoo — semua lewat BFF (route handlers di `src/app/api/v1/odoo/`).

## Dokumen otoritatif

**`HANDOFF.md` adalah dokumentasi sebenarnya repo ini (±2.400 baris).** Sebelum menyentuh area mana pun, baca bagian terkaitnya. README.md lama masih boilerplate — abaikan klaimnya. Design system: `design-system/nextjs-odoo/MASTER.md`.

## Konteks bisnis

Repo ini adalah separuh dari produk **"Odoo SaaS / Implementasi Odoo Premium"** milik PT Bima Creative Tech. Separuh lainnya: repo `odoo-platform` (Odoo 19 CE + 159 addons custom + tenant-orchestrator FastAPI). Keduanya BELUM terhubung — menghubungkannya adalah prioritas saat ini (fase C0–C2 di bawah). Rencana lengkap: repo `bct-website` → `docs/build-plan.md`.

## Commands

```bash
npm run dev          # port 3020 (bukan 3000)
npx vitest run       # 1.229 unit test — wajib hijau sebelum commit
npx vitest run -c vitest.live.config.mts   # live tests (butuh Odoo hidup)
npx tsx scripts/<nama>.mts                 # 17 script operasional (lihat HANDOFF.md)
```

Env divalidasi zod saat boot di `src/lib/env.ts` — error boot = env kurang, baca file itu.

## Aturan rumah (jangan dilanggar — semuanya punya alasan terdokumentasi)

1. **Jangan pernah reimplementasi otorisasi.** `ir.model.access` + record rules Odoo adalah satu-satunya otoritas. Frontend hanya menyembunyikan UI, tidak menjaga data.
2. **Transport pakai `undici.request()`, BUKAN `fetch()`.** undici fetch menulis ulang `Sec-Fetch-Mode` → `/json/2` menjawab 401 selamanya. Lihat `src/lib/odoo/transport/http.ts`.
3. Dua channel transport: `json2` (default) dan `callkw` (`call_button` hanya ada di sini). Trap kwargs/ids terdokumentasi di `json2-channel.ts` — baca sebelum menambah method.
4. **Semua cache di-key `(db, uid, lang, companyIds)`** via `tenantCacheKey()` — pelanggaran = bocor data antar tenant.
5. Pola API route: `requireOdooSession()` dari `src/lib/api-guard.ts` + `assertSameOrigin()` untuk write.
6. Kualitas: zero `TODO`/`@ts-ignore` di `src/`; komentar berbasis bukti (rujuk file/baris sumber Odoo atau hasil pengukuran); keputusan non-obvious ditulis di HANDOFF.md pada PR yang sama.
7. View rendering generik dari metadata — jangan hardcode per-model kecuali lewat `src/features/` + `_registry.ts`.

## Prioritas saat ini (fase C0–C1, lihat build plan BCT)

- [ ] C0: Dockerfile + service di compose `odoo-platform` · `.env.example` · README yang benar · CI (lint, typecheck, vitest).
- [ ] C1: validasi tenant slug ke `tenant_registry` (bukan transformasi string) · assert `session.db === resolveTenant(host).db` per request · wire `PLATFORM_ADMIN_HOST` · uji ≥2 database via `docker-compose.multitenant.yml` di odoo-platform.
- [ ] C2: konsumsi `ORCHESTRATOR_BASE_URL` (sekarang env mati tanpa pemakai) → tenant-orchestrator: signup → provision → undang admin.
- Backlog diketahui (dari HANDOFF): Discuss tanpa presence, dashboards read-only, widget DEGRADED=28, Keycloak belum pernah diuji end-to-end, belum ada rate limiting/logging terstruktur.

## Definisi selesai

`npx vitest run` hijau · typecheck bersih · perubahan perilaku terdokumentasi di HANDOFF.md · tidak menambah dependency tanpa justifikasi tertulis.
