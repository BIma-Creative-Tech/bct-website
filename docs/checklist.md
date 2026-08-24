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
| G-06 | Dockerfile + compose + .dockerignore (non-root, healthcheck) | devops-engineer | 🔨 IN PROGRESS | BUG DITEMUKAN CI 2026-08-24: `public/` kosong tidak ikut ter-checkout (Git tidak melacak direktori kosong) → `COPY /app/public ./public` di Dockerfile:25 gagal, job `docker` merah (run 32745250265). Diperbaiki dengan `public/.gitkeep`, Dockerfile TIDAK diubah. Menunggu run CI berikutnya untuk bukti hijau |
| G-07 | CI workflow (lint, build, audit, gitleaks, governance, docker) | devops-engineer | 🔨 IN PROGRESS | Run pertama 2026-08-24: `quality` ✅ (lint+build+audit+governance) dan `gitleaks` ✅; `docker` ❌ karena bug G-06 di atas. Workflow-nya sendiri terbukti benar — ia menangkap dua bug nyata (ESLint hilang, `public/` hilang) |
| G-08 | Release workflow (tag v* → image GHCR) | devops-engineer | 🟨 KONFIRMASI-OWNER | uji saat rilis v0.1.0 |
| G-09 | CHANGELOG + SECURITY.md + decisions.md | docs-keeper | 🟨 KONFIRMASI-OWNER | 2026-08-24 |
| G-10 | Push repo ke GitHub + CI hijau pertama | **owner** | 🔨 IN PROGRESS | Push ✅ 2026-08-24 atas perintah owner (`a54224d..559ad4e`, 4 commit). "CI hijau" belum tercapai: job `docker` merah karena bug G-06; menunggu run setelah perbaikan `public/.gitkeep` |
| G-11 | Isi data resmi: nomor WA, email, domain di content/site.ts | **owner** | 🟨 KONFIRMASI-OWNER | QA: 3 TODO hilang, `waLink()` render `wa.me/6285640718785?text=` di HTML, `new URL(site.domain)` build hijau, grep repo: kontak hanya di content/site.ts; domain `http://localhost:3000` MASIH SEMENTARA sampai W3-04; owner konfirmasi nilai email, 2026-08-24 |
| G-12 | Setup project Vercel + env dari .env.example | owner + devops-engineer | ⬜ TODO | |
| G-13 | ESLint flat config (`eslint.config.mjs`) agar `npm run lint` hijau | devops-engineer | 🟨 KONFIRMASI-OWNER | QA: `npm run lint` exit 0, 27 file dilint (app+components+content) 0 error/warning, config tidak mematikan rule apa pun, `react/jsx-no-target-blank`=error terbukti menyala pada file uji, diff package.json/lock kosong, 2026-08-24 |

## W1 — Struktur & Copy (target: minggu ke-1 Sep 2026, ±8 jam)

| ID | Tugas | Pemilik | Status | Bukti/Catatan |
|---|---|---|---|---|
| W1-01 | Copywriting semua halaman di content/ (beranda, 3 produk, pricing, tentang) | content-writer | 🟨 KONFIRMASI-OWNER | QA: 11 file, nihil lorem/placeholder liar, nihil jargon terlarang, nihil harga/kontak diketik ulang, 17 `[TANYA-OWNER]` semuanya komentar & tidak muncul di HTML render; 8 klaim faktual (DP 50%, kontrak 6 bln, diskon 20%, demo 15 mnt, KOMDIGI, read-only/SELECT-only, PostgreSQL+MySQL, 3 mesin) tertelusur ke docs/flight-plan.md & docs/build-plan.md, 2026-08-24 |
| W1-02 | Komponen layout: Nav + Footer + tombol WA floating | frontend-builder | 🟨 KONFIRMASI-OWNER | QA: build+lint+tsc hijau, `git diff app/globals.css` kosong & CSS terkompilasi hanya memuat 15 token resmi (nihil hex/text-gray/bg-white/`dark:`), dark mode via media query aktif, fokus ring tersusun benar (skip link tampil saat fokus), skip link → `#konten-utama`, `aria-expanded`+`aria-controls` menunjuk id yang ada, semua SVG `aria-hidden`, WA mengambang ber-`aria-label`, WA hanya lewat `waLink()`, 0 dependensi baru, 2026-08-24 |
| W1-03 | Beranda final (hero, produk, bukti, CTA) | frontend-builder | 🟨 KONFIRMASI-OWNER | QA ulang: lint/build/tsc exit 0; HTML dari `next start` terbit `<title>Sistem bisnis untuk UKM Indonesia — Bima Creative Tech</title>` (sufiks tunggal, tidak dobel), `og:title` + `twitter:title` identik dengan itu, judul fallback rute tak dikenal `Sistem bisnis modern untuk UKM Indonesia — Bima Creative Tech`; nihil regresi: tepat 1 `<h1>`, `description`/`canonical`/`metadataBase` tetap terbit, nol literal nama merek di app/page.tsx & app/layout.tsx (semua dari `site.name`), `content/copy/beranda.ts` tidak tersentuh, harga render Rp 2,5 jt / Rp 25–75 jt / Rp 5–15 jt = content/site.ts:51,76,100, 2026-08-24 |
| W1-04 | Review W1: copy + UI + konsistensi harga | qa-reviewer | 🟨 KONFIRMASI-OWNER | QA 2026-08-24: seluruh item W1 lulus — G-11, G-13, W1-01, W1-02 tetap 🟨 dan W1-03 lulus verifikasi ulang setelah sufiks `<title>` diperbaiki; `npm run lint` / `npm run build` / `npx tsc --noEmit` exit 0, `node scripts/check-governance.mjs` OK, CHANGELOG [Unreleased] mencatat content/copy/, components/, eslint.config.mjs, content/site.ts, app/page.tsx, app/layout.tsx; nihil status SELESAI ditulis agent (grep docs/, CHANGELOG, CLAUDE, README hanya menemukan penjelasan alur status). Di luar cakupan W1 dan tetap dilacak terpisah: domain produksi W3-04, Lighthouse W3-01/W3-03 |

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
| W3-01 | SEO: metadata semua halaman, sitemap.xml, robots.txt, OG image | frontend-builder | ⬜ TODO | Termasuk: OG image belum ada (sengaja tidak dikarang di W1) dan `app/not-found.tsx` bermetadata sendiri — halaman 404 bawaan Next menerbitkan `<title>` kedua. Pengukuran Lighthouse dipindah ke sini + W3-03 |
| W3-02 | Pasang Umami di VPS + env production | devops-engineer + owner | ⬜ TODO | |
| W3-03 | Uji aksesibilitas + mobile nyata (HP owner) | qa-reviewer + owner | ⬜ TODO | |
| W3-04 | Deploy production Vercel + domain + DNS | owner + devops-engineer | ⬜ TODO | **gerbang konfirmasi owner sebelum go-live** |
| W3-05 | Rilis v0.1.0: tag, CHANGELOG dipindah dari Unreleased, image GHCR terbit | devops-engineer | ⬜ TODO | setelah W3-04 dikonfirmasi |
| W3-06 | Audit keamanan pra-rilis penuh | security-auditor | ⬜ TODO | |
| W3-07 | Rekam video demo konsep Bima Insight untuk halaman produk | owner | ⬜ TODO | bahan dari build plan |

---

## Catatan lintas produk

Repo `bima-insight` (Okt 2026) dan fase C0–C5 `nextjs-odoo`/`odoo-platform` memakai pola checklist + tim agent yang sama — salin `.claude/agents/` dan format file ini saat repo/fase dimulai. Papan besarnya tetap `docs/build-plan.md`.
