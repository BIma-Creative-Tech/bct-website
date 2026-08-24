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
- W2-01: halaman produk ×3 — rute literal `app/produk/bima-insight/page.tsx`, `app/produk/odoo/page.tsx`, `app/produk/web-apps/page.tsx` (masing-masing ≤ 18 baris: hanya memilih copy dan menyusun metadata). Seluruh struktur section tinggal di 15 file baru `components/sections/` (`section-halaman`, `kepala-section`, `hero-halaman`, `daftar-poin`, `daftar-langkah`, `daftar-tanda`, `kolom-untuk-siapa`, `daftar-paket`, `daftar-faq`, `blok-cta-penutup`, `section-tambahan`, `halaman-produk`, `metadata-produk`, `kelas-section`, `index`), dirancang untuk dipakai ulang halaman `/pricing`, `/tentang`, dan `/studi-kasus` (W2-02..W2-04). FAQ memakai `<details>/<summary>` native — nol JavaScript, nol client component. Nol edit di `content/`, nol perubahan `app/globals.css`, nol dependensi baru.
- W2-09: `app/not-found.tsx` + copy baru `content/copy/tidak-ditemukan.ts` (didaftarkan di `content/copy/index.ts`) — halaman 404 bermerek Bahasa Indonesia dengan tombol WhatsApp dan tautan ke tiga rute produk yang sudah hidup, menggantikan 404 bawaan Next yang berbahasa Inggris.

### Changed

- W1-03: `app/page.tsx` ditulis ulang menjadi beranda utuh — hero, tiga produk, bukti, cara kerja, CTA penutup, plus metadata/OG halaman.
- W1-02: `app/layout.tsx` memasang skip link, nav, footer, dan tombol WA mengambang; konten dibungkus `<main id="konten-utama">` yang bisa menerima fokus.
- W1-02: judul default di `app/layout.tsx` dibalik menjadi `… — Bima Creative Tech` agar mengikuti pola judul di CLAUDE.md.
- G-11: `content/site.ts` — `whatsappNumber` dan `email` diisi data resmi dari owner; `domain` diisi sementara `http://localhost:3000` dengan komentar bahwa `metadataBase`/OG mengikutinya dan wajib diganti sebelum deploy production (W3-04).

### Fixed

- G-06: `public/.gitkeep` ditambahkan agar Git melacak direktori `public/`. Sebelumnya direktori itu kosong sehingga tidak ikut ter-checkout, dan `COPY /app/public ./public` di `Dockerfile:25` selalu gagal — job `docker` di CI merah pada push pertama (run 32745250265). Dockerfile tidak diubah. Hapus `.gitkeep` saat `public/` diisi favicon/OG image di W3-01.

- W2-09: `<title>` ganda berbahasa Inggris di halaman 404 hilang. Sebelumnya rute tak dikenal menerbitkan DUA `<title>`: satu default dari layout, plus `404: This page could not be found.` yang di-hardcode di `node_modules/next/dist/client/components/http-access-fallback/error-fallback.js`. Setelah `app/not-found.tsx` ada, terbit tepat satu `<title>Halaman tidak ditemukan — Bima Creative Tech</title>` dan status HTTP tetap 404 (diverifikasi lewat curl). Defek ini sebelumnya tercatat sebagai catatan pada item W3-01.

### Security

- G-13: `react/jsx-no-target-blank` dikeraskan ke `error` (preset Next mematikannya) — seluruh tautan `wa.me` bertarget `_blank` wajib membawa `rel="noopener noreferrer"` agar tidak bisa di-reverse-tabnab.
- W1-02: alamat email owner tidak pernah dirender sebagai teks maupun `mailto:` di HTML; jalur kontak diarahkan ke WhatsApp dan form `/api/lead`.
- G-14: `'unsafe-eval'` ditambahkan ke `script-src` di `next.config.ts` **hanya** bila `process.env.NODE_ENV === "development"`, agar React error overlay dan Fast Refresh (yang menyusun ulang callstack lewat `eval()`) berfungsi saat debugging. Header produksi tidak berubah sama sekali: security-auditor memverifikasi SHA-256 seluruh array header identik pada varian `NEXT_PUBLIC_UMAMI_SRC` kosong maupun terisi, dan cabangnya fail-closed terhadap 7 nilai `NODE_ENV` non-`development` (tidak diset, kosong, `production`, `test`, `staging`, `Development`, `DEVELOPMENT`). Verdict security-auditor: LULUS. Catatan operasional: nilai CSP dibakar saat BUILD, jadi artefak yang akan di-deploy tidak boleh pernah dibangun dengan `NODE_ENV=development` atau flag `next build --debug-prerender` (auditor membuktikan flag itu menghasilkan build exit 0 dengan `'unsafe-eval'` ikut terbakar). Guard CI untuk mengunci invariant ini sudah diantrekan sebagai item G-15 (menunggu konfirmasi owner karena menyentuh CI).
