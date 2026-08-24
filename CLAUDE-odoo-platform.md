# odoo-platform — Platform Odoo 19 CE + addons custom (produk BCT)

Mesin dari produk Odoo PT Bima Creative Tech: Odoo 19 Community (image di-pin by digest — JANGAN ganti ke tag rolling, pernah pecah karena itu; lihat `odoo/Dockerfile`), 159 addons custom bertingkat, orkestrasi multi-tenant, dan beberapa app headless.

## Dokumen otoritatif

- **`docs/architecture.md`** — baca "Module tiers", "Constraints to respect", dan "Deployment topology" sebelum mengubah apa pun.
- **Setiap modul punya `MODULE_KNOWLEDGE.md`** (124 file) — itu desain dokumen per modul. Mengubah modul = perbarui MODULE_KNOWLEDGE.md-nya di PR yang sama. Pola ini dipertahankan.
- Kepatuhan: `docs/coretax.md`, `docs/pdp-compliance.md`, `docs/tax-reporting-requirements.md`.

## Peta addons (tier = folder)

| Folder | Isi | Aturan |
|---|---|---|
| `addons/_vendor/` | OCA (auth_jwt, base_rest, queue_job, …) | JANGAN diedit; update via `fetch_oca.sh` |
| `addons/core/` | Primitif platform (secure_endpoint HMAC, operating unit, adapter framework) | Perubahan berdampak luas — hati-hati |
| `addons/ee_gap/` | Delta CE→EE (flagship: `custom_accounting_reports`, `custom_tax_id`, `custom_coretax_export`) | Bagian terbesar |
| `addons/compliance/` | Coretax/e-Faktur (XSD resmi DJP + signing XAdES), Bupot, suite PDP (6 modul) | Nilai jual utama — uji ketat |
| `addons/verticals/` | PPOB suite, F&B | |
| `addons/control_plane/`, `operations/` | Hub console, onboarding, super admin, tenant infra | |
| `addons/_tenants/` | Modul klien spesifik (levis_*, arka_*) | **BUKAN produk BCT — jangan masukkan ke edisi komersial** |

Menambah GRUP addons baru menyentuh **8 titik registrasi** (documented di architecture.md) — hindari; tambahkan modul ke grup existing.

## Konvensi wajib

1. Manifest versi `19.0.x.y.z` — naikkan patch di tiap perubahan; migrasi di `migrations/<versi>/`.
2. Endpoint machine-to-machine: `auth="none"` + decorator `@secure_endpoint` dari `custom_core` (HMAC-SHA256 timestamp+body, nonce Redis). Endpoint user-facing: ikuti pola **`custom_project_api`** (JWT pendek + refresh sekali pakai + user `res.users` asli agar record rules & audit trail jalan) — bukan pola satu-static-user.
3. **Endpoint baru wajib berprefix `/v1` dan dispesifikasikan OpenAPI** (gap terbesar repo ini: kontrak API tanpa penjaga tipe). Contoh spec yang benar: `docs/integrations/mdm-product-api.openapi.yaml`.
4. Tulis test (225 file test sudah ada — jangan turunkan standar); pre-commit (ruff, bandit, gitleaks, hadolint) harus lulus.
5. Secrets via SOPS (`.secrets.enc.yaml`) — tidak pernah plaintext di compose/env yang di-commit.
6. Compose: base `docker-compose.yml` + overlay per kebutuhan (`make up-dev`, `up-multitenant`, `up-prod`, …). Jangan membuat compose baru; tambah overlay.

## Konteks bisnis & prioritas (lihat repo bct-website → docs/build-plan.md)

- Frontend produk masa depan = repo `sarangrumah/nextjs-odoo` (belum terhubung ke repo ini — fase C0 menambahkan service-nya ke compose).
- **C3 — kurasi edisi komersial BCT:** ERP Dasar (core + accounting reports + PSAK/PPN) · +Kepatuhan Pajak (coretax*) · +PDP · +Retail/WMS. Yang DIKELUARKAN dari edisi komersial: `_tenants/*`, bridge ekosistem pemberi kerja (eraspace/esb/oracle/sap), PPOB. **Audit IP tiap modul sebelum masuk edisi.**
- Gap jujur yang diketahui: WAL archiving belum aktif (RPO nyata 24 jam, runbook mengklaim 1 jam — perbaiki sebelum klien produksi); VPS router orkestrator masih demo-mode dan belum diregister di `app/main.py`; addons_path tenant VPS flat vs 8 grup di host utama (divergensi nyata).

## Definisi selesai

Test modul terkait hijau · pre-commit lulus · MODULE_KNOWLEDGE.md diperbarui · versi manifest naik · tidak menyentuh `_vendor/`.
