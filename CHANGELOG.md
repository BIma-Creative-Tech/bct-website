# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/); versi mengikuti [SemVer](https://semver.org/lang/id/).
Aturan proyek: setiap perubahan kode wajib tercatat di [Unreleased] pada commit yang sama (ditegakkan CI oleh `scripts/check-governance.mjs`).

## [Unreleased]

### Added
- Scaffold awal: CLAUDE.md, design tokens, `content/site.ts`, halaman beranda, docs plan.
- Tim multi-agent `.claude/agents/` (lead, frontend-builder, content-writer, security-auditor, devops-engineer, qa-reviewer, docs-keeper).
- Security: headers (CSP/HSTS/dll.) di `next.config.ts`, endpoint lead `/api/lead` (zod + honeypot + rate limit), SECURITY.md.
- Docker: Dockerfile multi-stage non-root + docker-compose + .dockerignore.
- CI/CD: workflow CI (lint, build, audit, gitleaks, governance check, docker build) dan Release (tag → GHCR).
- Governance: docs/checklist.md dengan gerbang konfirmasi owner, docs/decisions.md, CHANGELOG ini.
- W1-01: `content/copy/` — 11 modul copy Bahasa Indonesia bertipe (beranda, 3 halaman produk, pricing, tentang, kerangka studi kasus & kontak, string nav/footer/WA). Harga, nomor WA, dan email tidak diduplikasi di sini.
- W1-02: `components/` — `site-nav` (menu mobile + dropdown produk + Escape), `site-footer`, `wa-floating-button`, `wa-button`, `link-button`, `eyebrow`, `skip-link`, dan util kelas bersama `styles.ts`.
- G-13: `eslint.config.mjs` — flat config ESLint 9 memakai `eslint-config-next/core-web-vitals` + `/typescript`, tanpa dependency baru. Sebelumnya repo tidak punya config ESLint sama sekali, sehingga `npm run lint` dan step lint di CI selalu merah.

### Changed

- W1-03: `app/page.tsx` ditulis ulang menjadi beranda utuh — hero, tiga produk, bukti, cara kerja, CTA penutup, plus metadata/OG halaman.
- W1-02: `app/layout.tsx` memasang skip link, nav, footer, dan tombol WA mengambang; konten dibungkus `<main id="konten-utama">` yang bisa menerima fokus.
- W1-02: judul default di `app/layout.tsx` dibalik menjadi `… — Bima Creative Tech` agar mengikuti pola judul di CLAUDE.md.
- G-11: `content/site.ts` — `whatsappNumber` dan `email` diisi data resmi dari owner; `domain` diisi sementara `http://localhost:3000` dengan komentar bahwa `metadataBase`/OG mengikutinya dan wajib diganti sebelum deploy production (W3-04).

### Security

- G-13: `react/jsx-no-target-blank` dikeraskan ke `error` (preset Next mematikannya) — seluruh tautan `wa.me` bertarget `_blank` wajib membawa `rel="noopener noreferrer"` agar tidak bisa di-reverse-tabnab.
- W1-02: alamat email owner tidak pernah dirender sebagai teks maupun `mailto:` di HTML; jalur kontak diarahkan ke WhatsApp dan form `/api/lead`.
