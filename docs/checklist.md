# Checklist Development — bct-website

**Satu-satunya papan status proyek ini.** Setiap perubahan kode wajib memperbarui file ini (ditegakkan CI).

Alur status: `⬜ TODO` → `🔨 IN PROGRESS` → `🧪 REVIEW` (qa-reviewer) → `🟨 KONFIRMASI-OWNER` → `✅ SELESAI`

**Aturan ✅:** hanya owner (Ade) yang bisa menjadikan ✅ — dengan mengatakan "konfirmasi <ID>" ke agent, atau mengedit sendiri. Agent maksimal berhenti di 🟨. Setiap 🟨 wajib menyertakan bukti satu baris (apa yang dicek, tanggal).

---

## G — Fondasi & Governance

| ID | Tugas | Pemilik | Status | Bukti/Catatan |
|---|---|---|---|---|
| G-01 | Scaffold Next.js + design tokens + content/site.ts | frontend-builder | 🟨 KONFIRMASI-OWNER | build hijau di sandbox, 2026-08-24 |
| G-02 | CLAUDE.md + docs (flight-plan, build-plan) | docs-keeper | 🟨 KONFIRMASI-OWNER | 2026-08-24 |
| G-03 | Tim agent `.claude/agents/` (7 agent) | lead | 🟨 KONFIRMASI-OWNER | 2026-08-24 |
| G-04 | Security headers (CSP/HSTS/dll.) di next.config.ts | devops-engineer | 🟨 KONFIRMASI-OWNER | header terpasang, build hijau, 2026-08-24 |
| G-05 | Endpoint /api/lead (zod + honeypot + rate limit) | frontend-builder | 🟨 KONFIRMASI-OWNER | perlu uji nyata saat form dibuat di W2 |
| G-06 | Dockerfile + compose + .dockerignore (non-root, healthcheck) | devops-engineer | 🟨 KONFIRMASI-OWNER | `docker build` belum diuji di lingkungan owner |
| G-07 | CI workflow (lint, build, audit, gitleaks, governance, docker) | devops-engineer | 🟨 KONFIRMASI-OWNER | aktif setelah push pertama ke GitHub |
| G-08 | Release workflow (tag v* → image GHCR) | devops-engineer | 🟨 KONFIRMASI-OWNER | uji saat rilis v0.1.0 |
| G-09 | CHANGELOG + SECURITY.md + decisions.md | docs-keeper | 🟨 KONFIRMASI-OWNER | 2026-08-24 |
| G-10 | Push repo ke GitHub + CI hijau pertama | **owner** | ⬜ TODO | dari komputer owner (lihat instruksi sesi Cowork) |
| G-11 | Isi data resmi: nomor WA, email, domain di content/site.ts | **owner** | ⬜ TODO | 3 TODO tertanda di file |
| G-12 | Setup project Vercel + env dari .env.example | owner + devops-engineer | ⬜ TODO | |

## W1 — Struktur & Copy (target: minggu ke-1 Sep 2026, ±8 jam)

| ID | Tugas | Pemilik | Status | Bukti/Catatan |
|---|---|---|---|---|
| W1-01 | Copywriting semua halaman di content/ (beranda, 3 produk, pricing, tentang) | content-writer | ⬜ TODO | DoD: tanpa placeholder; daftar [TANYA-OWNER] dilaporkan |
| W1-02 | Komponen layout: Nav + Footer + tombol WA floating | frontend-builder | ⬜ TODO | DoD: responsive, dark mode, fokus keyboard |
| W1-03 | Beranda final (hero, produk, bukti, CTA) | frontend-builder | ⬜ TODO | DoD: Lighthouse mobile ≥ 90 |
| W1-04 | Review W1: copy + UI + konsistensi harga | qa-reviewer | ⬜ TODO | |

## W2 — Semua Halaman (minggu ke-2, ±10 jam)

| ID | Tugas | Pemilik | Status | Bukti/Catatan |
|---|---|---|---|---|
| W2-01 | Halaman produk ×3 (bima-insight, odoo, web-apps) | frontend-builder | ⬜ TODO | data dari content/site.ts |
| W2-02 | Halaman pricing (rate card + custom "mulai dari") | frontend-builder | ⬜ TODO | + tombol unduh rate card PDF |
| W2-03 | Halaman studi kasus (KOMDIGI + retail) | content-writer + frontend-builder | ⬜ TODO | fakta dari owner bila kurang |
| W2-04 | Halaman tentang (sejarah BCT, cara kerja) | content-writer + frontend-builder | ⬜ TODO | |
| W2-05 | Halaman kontak + form → /api/lead + fallback WA | frontend-builder | ⬜ TODO | DoD: honeypot & rate limit teruji manual |
| W2-06 | Insight/blog: list + detail MDX + 1 artikel perdana | content-writer + frontend-builder | ⬜ TODO | |
| W2-07 | Audit keamanan form & halaman baru | security-auditor | ⬜ TODO | verdict LULUS wajib sebelum 🟨 |
| W2-08 | Review W2 menyeluruh | qa-reviewer | ⬜ TODO | |

## W3 — Poles & Rilis (minggu ke-3, ±10 jam)

| ID | Tugas | Pemilik | Status | Bukti/Catatan |
|---|---|---|---|---|
| W3-01 | SEO: metadata semua halaman, sitemap.xml, robots.txt, OG image | frontend-builder | ⬜ TODO | |
| W3-02 | Pasang Umami di VPS + env production | devops-engineer + owner | ⬜ TODO | |
| W3-03 | Uji aksesibilitas + mobile nyata (HP owner) | qa-reviewer + owner | ⬜ TODO | |
| W3-04 | Deploy production Vercel + domain + DNS | owner + devops-engineer | ⬜ TODO | **gerbang konfirmasi owner sebelum go-live** |
| W3-05 | Rilis v0.1.0: tag, CHANGELOG dipindah dari Unreleased, image GHCR terbit | devops-engineer | ⬜ TODO | setelah W3-04 dikonfirmasi |
| W3-06 | Audit keamanan pra-rilis penuh | security-auditor | ⬜ TODO | |
| W3-07 | Rekam video demo konsep Bima Insight untuk halaman produk | owner | ⬜ TODO | bahan dari build plan |

---

## Catatan lintas produk

Repo `bima-insight` (Okt 2026) dan fase C0–C5 `nextjs-odoo`/`odoo-platform` memakai pola checklist + tim agent yang sama — salin `.claude/agents/` dan format file ini saat repo/fase dimulai. Papan besarnya tetap `docs/build-plan.md`.
