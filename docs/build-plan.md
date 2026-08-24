# BCT Build Plan — Rencana Development 3 Produk (24 Agu 2026)

> Versi visual lengkap (internal): https://claude.ai/code/artifact/78d8f1a6-9d5a-4d46-bbd4-0493642a179b

**Keputusan dasar:** urutan berurutan **Website → Bima Insight → Odoo SaaS**; infra campuran (Vercel untuk app Next.js, VPS untuk Odoo/Postgres/services); Bima Insight multi-tenant "tipis" dari awal. Kapasitas ±35 jam/bulan.

## Timeline

| Periode | Fase | Estimasi |
|---|---|---|
| Sep 2026 | Website BCT (repo ini) — 3 sprint | ±28 jam |
| Okt–Des 2026 | Bima Insight M1 Fondasi + Demo | ±90 jam |
| Jan–Mar 2027 | Bima Insight M2 Dashboard + 3 Pilot berbayar | ±75 jam |
| Apr–Mei 2027 | Bima Insight M3 Embed + Ops ∥ Odoo SaaS C0–C1 | ±35 + 28 jam |
| Jun–Jul 2027 | Odoo SaaS C2 Provisioning + C3 Kurasi edisi | ±34 jam |
| Agu 2027 | Odoo SaaS C4 Layer komersial (evaluasi gate Q4) | ±18 jam |

## Produk 2 — Bima Insight (arsitektur 5 layer)

Sumber data klien (kredensial **read-only** wajib) → Connector Service FastAPI di VPS (introspeksi skema + eksekutor SQL tervalidasi: SELECT-only, LIMIT, timeout) → **Knowledge Store per tenant berversi** (table knowledge, column knowledge, relationship, metric library — moat produk) → Claude API NL→SQL Bahasa Indonesia (prompt caching, metering per tenant) → permukaan Next.js multi-tenant (dashboard builder drag-drop, chat "Tanya Data", knowledge editor, embed & REST API).

## Produk 3 — Odoo SaaS (proyek penggabungan, bukan pembangunan)

- `sarangrumah/nextjs-odoo` = frontend Odoo 19 metadata-driven yang matang (±79rb LOC, 1.229 unit test). Gap: multi-tenant routing perlu hardening, deploy artifact/CI hampir kosong, subscription/billing/provisioning 0%.
- `sarangrumah/odoo-platform` = 159 addons custom (flagship: accounting reports, Coretax/e-Faktur XSD resmi DJP, suite UU PDP) + tenant-orchestrator FastAPI. Gap: tidak ada kontrak API bertipe; nextjs-odoo belum terhubung.
- Fase: C0 perekat (compose+CI) → C1 hardening tenant routing → C2 wiring provisioning → C3 kurasi edisi addons (keluarkan modul klien-spesifik & berisiko IP) → C4 layer komersial → C5 kesiapan produksi.
- **Dua jalur monetisasi:** jual sekarang sebagai "Implementasi Odoo Premium" single-tenant; SaaS self-serve hanya setelah gate Q4.

## Keputusan teknis lintas produk

Satu design system Next.js + Tailwind · endpoint baru selalu `/v1` + OpenAPI → generated TS client · auth ikut pola `custom_project_api` (JWT pendek + refresh sekali pakai + user asli), HMAC `custom_core` untuk M2M · SOPS untuk secrets · keamanan data klien: read-only + enkripsi + audit log + masking (UU PDP) · setiap milestone ditutup artefak jualan (demo/video/studi kasus).

## Risiko utama

1. **Audit IP addons** — modul bernuansa ekosistem pemberi kerja dikeluarkan dari paket komersial BCT (selesaikan sebelum C3).
2. Scope creep Insight — M1 hanya Postgres + MySQL.
3. Multi-tenant dari awal memperlambat demo — skeleton tenant dikerjakan sekali di awal M1, jangan disentuh lagi sampai M2.
4. Satu orang tiga codebase — DoD ketat + dokumentasi sambil jalan (pola MODULE_KNOWLEDGE.md diteruskan).
