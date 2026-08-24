# bct-website — Website resmi PT Bima Creative Tech (BCT)

Website company profile + aset jualan BCT. **Tujuan tunggal halaman apa pun: mengubah pengunjung menjadi chat WhatsApp.** Semua keputusan desain/konten diukur terhadap tujuan itu.

## Konteks bisnis (baca dulu)

- BCT = studio IT solo (Ade), produk: **Bima Insight** (BOT Agent baca database + dashboard interaktif, SaaS), **Odoo** (implementasi paket UMKM + retainer Odoo Care + frontend Next.js premium), **Web & Apps** (paket company profile + AI chat, custom development selektif).
- Konteks lengkap ada di `docs/flight-plan.md` (strategi bisnis 12 bulan) dan `docs/build-plan.md` (rencana development 3 produk). **Baca keduanya sebelum menulis copy atau menambah halaman.**
- Kapasitas dev pemilik hanya 5–10 jam/minggu — jangan tambah kompleksitas yang butuh maintenance (CMS eksternal, backend database, auth). Situs ini statis/ISR.

## Stack

- Next.js (App Router) + TypeScript strict + Tailwind CSS v4 (`@tailwindcss/postcss`).
- Konten = file TS/MDX di `content/` — TIDAK ada CMS. Copy per halaman di `content/copy/` (bertipe, diimpor lewat `@/content/copy`). Data produk & harga di `content/site.ts` adalah **satu-satunya sumber kebenaran** untuk nama paket, harga, dan CTA; komponen tidak boleh hardcode angka harga.
- Deploy: Vercel. Analytics: Umami (script di layout, env `NEXT_PUBLIC_UMAMI_*`; jangan pakai Google Analytics).
- Tidak ada komponen library berat (shadcn boleh dipetik per-komponen bila perlu). Tidak ada state management library.

### Commands

```bash
npm run dev      # dev server
npm run build    # production build — harus lulus sebelum commit
npm run lint     # eslint
```

## Design system (WAJIB diikuti, jangan improvisasi warna/font baru)

Identitas visual sudah ditetapkan (turunan dari dokumen Flight Plan). Token didefinisikan di `app/globals.css`:

- Font: **Bricolage Grotesque** (display/heading, weight 700–800), **Figtree** (body), **IBM Plex Mono** (label kecil, eyebrow, angka). Via Google Fonts (`next/font`).
- Light: bg `#f6f5f1`, surface `#fcfcfb`, ink `#191813`, ink-2 `#54524c`, line `#e3e1d8`, **accent emas `#96660f`**.
- Dark: bg `#0e0d0b`, surface `#1a1a19`, ink `#f2f0e9`, ink-2 `#c3c2b7`, line `#2c2c2a`, accent `#d9a84e`.
- Dark mode wajib jalan (class/system). Eyebrow style: mono uppercase letter-spacing + garis pendek accent di kiri.
- Nada visual: tenang, presisi, "engineering studio" — bukan agensi marketing yang ramai. Satu aksen emas, sisanya netral.

## Bahasa & suara

- Seluruh situs **Bahasa Indonesia** (EN menyusul, jangan siapkan i18n sekarang).
- Suara: jujur, konkret, teknis-tapi-bisnis. Tanpa jargon marketing kosong ("solusi terdepan", "one stop solution" — DILARANG). Sebut angka dan bukti (10 tahun IT, case study KOMDIGI).
- **Tidak pernah lorem ipsum / placeholder.** Kalau konten belum ada, ambil dari `docs/`, atau tandai TODO di kode + daftar di PR description.
- Harga selalu ditampilkan ("mulai Rp X") — kebijakan BCT: rate card terbuka. Angka harga = yang ada di `content/site.ts` (sumber: build plan; label "indikatif" sampai divalidasi).

## Sitemap & status

| Route | Halaman | Status |
|---|---|---|
| `/` | Beranda: proposisi + 3 produk + bukti + CTA WA | beranda utuh (W1-03) — status mutakhir di `docs/checklist.md` |
| `/produk/bima-insight` | Bima Insight | belum |
| `/produk/odoo` | Implementasi Odoo + Odoo Care | belum |
| `/produk/web-apps` | Paket web & custom apps | belum |
| `/pricing` | Rate card lengkap (default + custom "mulai dari") | belum |
| `/studi-kasus` | KOMDIGI e-Telekomunikasi + retail | belum |
| `/tentang` | Sejarah BCT, cara kerja, tiga mesin | belum |
| `/insight` | Blog/artikel pendek (MDX) | belum |
| `/kontak` | Form lead + WA | belum |

## Backlog sprint (kerjakan berurutan)

- **W1 — Struktur & copy:** finalisasi copywriting semua halaman di `content/`, layout + nav + footer, halaman beranda utuh.
- **W2 — Semua halaman:** produk ×3, pricing, studi kasus, tentang, kontak (form → mailto/API route sederhana → email + link WA), insight (MDX list + detail).
- **W3 — Poles & rilis:** SEO (metadata per halaman, sitemap.xml, robots, OG image), Umami, aksesibilitas, uji mobile, deploy Vercel + domain.

**Definition of Done situs:** live di domain sendiri · semua halaman konten nyata · form & tombol WA teruji · Lighthouse mobile ≥ 90 semua kategori · rate card PDF bisa diunduh · analytics mencatat.

## Aturan kerja

1. Mobile-first; heading `text-wrap: balance`; body max ±65ch.
2. Tombol WhatsApp (floating + di tiap section CTA) memakai util `waLink(pesan)` dari `content/site.ts` — nomor WA hanya didefinisikan sekali di sana.
3. Setiap halaman punya `metadata` Next.js lengkap (title pola `X — Bima Creative Tech`, description, OG).
4. Jangan menambah dependensi tanpa alasan tertulis di PR. Jangan tambah halaman di luar sitemap tanpa diminta.
5. Selesai fitur = `npm run build` hijau + cek visual light & dark.

## Tim agent & orkestrasi (WAJIB)

Tugas multi-langkah apa pun dimulai dari agent **`lead`** (`.claude/agents/lead.md`) — ia memecah pekerjaan, mendelegasikan, dan menjaga checklist. Spesialis di bawahnya:

| Agent | Tugas | Batas |
|---|---|---|
| `lead` | Orkestrasi, pecah tugas, delegasi, update checklist, lapor | Tidak menulis fitur sendiri |
| `frontend-builder` | Halaman/komponen Next.js + Tailwind sesuai token | Tidak menulis copy, tidak sentuh CI/Docker |
| `content-writer` | Copy Bahasa Indonesia (content/, docs/) | Tidak sentuh kode komponen |
| `security-auditor` | Audit keamanan diff API/form/config/deps/Docker/CI | Read-only + laporan berperingkat |
| `devops-engineer` | Docker, workflow CI/CD, release/versioning, env | Perubahannya wajib diaudit security-auditor |
| `qa-reviewer` | Verifikasi DoD, naikkan status ke 🟨 | Tidak boleh meloloskan dengan catatan |
| `docs-keeper` | CHANGELOG, checklist, decisions.md, README sinkron | Tidak sentuh kode aplikasi |

## Governance (ditegakkan CI — bukan sekadar konvensi)

- **Papan status: `docs/checklist.md`.** Alur: ⬜ → 🔨 → 🧪 → 🟨 KONFIRMASI-OWNER → ✅. **Hanya owner (Ade) yang menjadikan ✅** — agent berhenti di 🟨 dengan bukti satu baris. Owner mengonfirmasi dengan "konfirmasi <ID>".
- **Setiap perubahan kode** wajib memperbarui `CHANGELOG.md` ([Unreleased], format Keep a Changelog) dan `docs/checklist.md` di commit yang sama — CI merah bila tidak (`scripts/check-governance.mjs`).
- **Commit**: Conventional Commits (feat/fix/chore/docs/ci/sec). **Rilis**: SemVer; tag `v*` → CI build image ke `ghcr.io/sarangrumah/bct-website`; tag hanya setelah owner konfirmasi.
- **Keamanan**: baca `SECURITY.md`; header di `next.config.ts` dan pola `/api/lead` (zod + honeypot + rate limit) adalah baseline — jangan diturunkan.
- **Keputusan penting** dicatat di `docs/decisions.md` (ADR mini) pada sesi yang sama.
- Gerbang konfirmasi owner: deploy production, perubahan harga/pricing, dependency baru, perubahan CI/Docker, dan hal yang menyentuh data pribadi.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
