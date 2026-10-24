# bct-website — Website resmi PT Bima Creative Tech (BCT)

Website company profile + aset jualan BCT. **Tujuan tunggal halaman apa pun: mengubah pengunjung menjadi chat WhatsApp.** Semua keputusan desain/konten diukur terhadap tujuan itu.

## Konteks bisnis (baca dulu)

- BCT = studio IT solo (Ade), produk: **Bima Insight** (BOT Agent baca database + dashboard interaktif, SaaS), **Odoo** (implementasi paket UMKM + retainer Odoo Care + frontend Next.js premium), **Web & Apps** (paket company profile + AI chat, custom development selektif).
- Konteks lengkap ada di `docs/flight-plan.md` (strategi bisnis 12 bulan) dan `docs/build-plan.md` (rencana development 3 produk). **Baca keduanya sebelum menulis copy atau menambah halaman.**
- Kapasitas dev pemilik hanya 5–10 jam/minggu — jangan tambah kompleksitas yang butuh maintenance (CMS eksternal, backend database, auth). Situs ini statis/ISR.

## Stack

- Next.js (App Router) + TypeScript strict + Tailwind CSS v4 (`@tailwindcss/postcss`).
- Konten = file TS/MDX di `content/` — TIDAK ada CMS. Copy per halaman di `content/copy/` (bertipe, diimpor lewat `@/content/copy`). Data produk & harga di `content/site.ts` adalah **satu-satunya sumber kebenaran** untuk nama paket, harga, dan CTA; komponen tidak boleh hardcode angka harga.
- Runtime: **Node 24** (`engines` `>=24 <25`), semua dependency di-pin versi persis (tanpa `^`/`~`, `.npmrc` `save-exact`). Referensi platform: `/opt/src/web-starter` (ADR 2026-09-26).
- Deploy: **self-host di VPS di belakang Traefik** (BUKAN Vercel) — image `ghcr.io/bima-creative-tech/bct-website`, diprovisikan repo infra lewat `/opt/infra/scripts/provision-web-client.sh`. Kontrak container: port 3000, `GET /api/health`, uid 1001, rootfs read-only, env `SITE_URL` wajib (URL kanonik; host `staging`/localhost → noindex). CSP ber-nonce per request di `proxy.ts` (Traefik tidak menyetel CSP), HSTS di Traefik. Detail: README §Deploy.
- Analytics: Umami self-host, env **runtime** `UMAMI_SCRIPT_URL` + `UMAMI_WEBSITE_ID` (berpasangan; kontrak infra plan 11 disetujui GATE 1 2026-09-27, terpusat di `lib/umami.ts` — jangan ditulis ulang di tempat lain). Aktif → `<script defer nonce>` server-rendered di root layout + origin skrip di CSP `script-src`/`connect-src` (G-47); opsi `data-exclude-search`/`data-do-not-track` = konstanta `OPSI_PRIVASI_UMAMI` (disetujui GATE 1 Q4; `/privasi` menjanjikannya — ubah bersamaan). Jangan pakai `NEXT_PUBLIC_*` untuk nilai per-lingkungan, jangan pakai Google Analytics.
- **Stack UI referensi platform** (ADR 2026-09-26 "Stack UI referensi", sama dengan `/opt/src/web-starter`, versi di-pin persis): ikon **Iconsax** `iconsax@0.1.1` (web component, ikon GRATIS saja), animasi **Motion** `motion@13.4.3` dan **anime.js** `animejs@4.5.0`, komponen **21st.dev** (Magic UI, MIT) yang DISALIN ke `components/ui-21st/` (bukan dependency runtime; asal-usul & lisensi wajib dicatat di `COMPONENTS.md`, komponen tanpa lisensi jelas ditolak). shadcn hanya bila benar-benar perlu, per komponen. Tidak ada state management library. Keputusan desain/gerak + query ui-ux-pro-max: `docs/design.md`.
- Ikon: pakai `<Icon name=…>` (`components/icon.tsx`); tambah nama di `components/icon-names.ts` lalu `npm run icons` (otomatis juga di `npm run build`) dan commit `lib/generated/iconsax-icons.json`. Jangan `npx iconsax sync` (itu ikon Pro berbayar), jangan menggambar SVG ikon sendiri bila Iconsax punya padanannya (logo merek boleh tetap). Setelah mengganti `name` ikon secara dinamis, pasang `key` baru (loader hanya mengaktifkan elemen baru).

### Commands

Host VPS **tidak punya Node** — jalankan lewat container (repo di-mount), seperti web-starter:

```bash
docker run --rm -v "$PWD:/app" -w /app node:24.22.1-bookworm-slim sh -c \
  'npm ci && npm run icons && npm run lint && npm run typecheck && npm test && npm run build'
# dev server (SITE_URL wajib)
docker run --rm -it -v "$PWD:/app" -w /app -p 127.0.0.1:3000:3000 -e SITE_URL=http://localhost:3000 \
  node:24.22.1-bookworm-slim npm run dev -- -H 0.0.0.0
```

`npm run lint` (eslint, 0 warning) · `npm run typecheck` (next typegen + tsc) · `npm test` (vitest, `tests/unit/`) · `npm run build` — semuanya harus lulus sebelum commit. Guard: `node scripts/check-pii.mjs` (setelah build), `node scripts/check-csp.mjs <url> <path…>` (terhadap server hidup). Hook gitleaks: `git config core.hooksPath .githooks` sekali per clone.

## Design system (WAJIB diikuti, jangan improvisasi warna/font baru)

Identitas visual sudah ditetapkan (turunan dari dokumen Flight Plan). Token didefinisikan di `app/globals.css`:

- Font: **Bricolage Grotesque** (display/heading, weight 700–800), **Figtree** (body), **IBM Plex Mono** (label kecil, eyebrow, angka). Via Google Fonts (`next/font`).
- Light: bg krem `#fffbd5`, surface `#fffdf0`, ink `#191813`, ink-2 `#54524c`, line `#e8dfae`, **accent merah `#b20a2c`**.
- Dark: bg `#0e0d0b`, surface `#1a1a19`, ink `#f2f0e9`, ink-2 `#c3c2b7`, line `#2c2c2a`, accent `#f0566f` (merah dicerahkan agar lolos AA di latar gelap).
- Gradien merek `--gradien` = `linear-gradient(to right, #b20a2c, #fffbd5)` (dark: ujung krem transparan 35%), lewat utilitas `bg-gradien`. **Hanya pita dekoratif ber-`aria-hidden`** (tepi atas header, penutup hero, tepi atas kartu CTA, kartu OG) — tidak pernah latar teks, karena tidak ada warna teks yang lolos AA di sepanjang merah→krem (ADR 2026-09-24).
- Blok di atas foto (hero beranda) memakai kelas `.tema-gelap` di `app/globals.css` — palet dark yang sama dipasang lokal, jadi tetap gelap di light mode. Jangan menaruh teks di atas foto tanpa kelas ini dan tanpa selubung (`bg-selubung-rata` / `lg:bg-selubung-foto`).
- Gerak & efek (G-38/G-39, menggantikan aturan "tanpa library animasi" G-29): **setiap gerak WAJIB di balik `motion-safe:` / `prefers-reduced-motion` dan hanya menganimasikan `transform`/`opacity`** (compositor). Mekanisme yang ada — pakai, jangan buat jalur kedua: intro hero = `<HeroAnimator>` (anime.js adapter WAAPI, mulai saat idle, teks hero TIDAK pernah disembunyikan; tandai baris dengan `data-hero-init="lift"`); reveal saat digulir = `<Reveal>` / `propsReveal(i)` (`components/reveal.tsx`) yang dijalankan `<ScrollEnhancer>` di root layout; angka = `<AngkaStatistik teks=…>` (Number Ticker, server merender nilai akhir, angka HANYA dari `content/site.ts`); Motion hanya di-import dinamis (`lib/motion-lazy.ts`), jangan `motion/react` di komponen atas-lipatan; gerak ambient tanpa akhir (blob, chip melayang, kotak grid) hanya ≥ 768px; marquee wajib bisa dijeda (`MarqueePauseButton`, WCAG 2.2.2) dan hanya berisi konten nyata. Komponen 21st.dev yang ada: `bento-grid`, `number-ticker`, `marquee`, `animated-grid-pattern` — warna hanya token BCT. Utilitas gaya bersama tetap `kartuInteraktif` / `chipIkon` / `nomorBesar` di `components/styles.ts`, `<BlobLatar>`, `<JudulSorot>`, `<CahayaKursor>` (client, hanya beranda).
- Dark mode wajib jalan (class/system). Eyebrow style: mono uppercase letter-spacing + garis pendek accent di kiri.
- Nada visual: tenang, presisi, "engineering studio" — bukan agensi marketing yang ramai. Satu aksen merah (plus pita gradiennya), sisanya netral.

## Bahasa & suara

- Seluruh situs **Bahasa Indonesia** (EN menyusul, jangan siapkan i18n sekarang).
- Suara: jujur, konkret, teknis-tapi-bisnis. Tanpa jargon marketing kosong ("solusi terdepan", "one stop solution" — DILARANG). Sebut angka dan bukti (10 tahun IT, case study KOMDIGI).
- **Tidak pernah lorem ipsum / placeholder.** Kalau konten belum ada, ambil dari `docs/`, atau tandai TODO di kode + daftar di PR description.
- Harga selalu ditampilkan ("mulai Rp X") — kebijakan BCT: rate card terbuka. Angka harga = yang ada di `content/site.ts` (sumber: build plan; label "indikatif" sampai divalidasi).

## Sitemap & status

| Route | Halaman | Status |
|---|---|---|
| `/` | Beranda: proposisi + 3 produk + bukti + CTA WA | hidup (W1-03) — status mutakhir di `docs/checklist.md` |
| `/produk/bima-insight` | Bima Insight | hidup (W2-01) |
| `/produk/odoo` | Implementasi Odoo + Odoo Care | hidup (W2-01) |
| `/produk/web-apps` | Paket web & custom apps | hidup (W2-01) |
| `/pricing` | Rate card lengkap (default + custom "mulai dari") | hidup (W2-02); tombol unduh PDF belum (W2-11) |
| `/studi-kasus` | KOMDIGI e-Telekomunikasi + retail | belum (W2-03) — tertahan menunggu fakta proyek dari owner |
| `/tentang` | Sejarah BCT, cara kerja, tiga mesin | hidup (W2-04) |
| `/insight` | Blog/artikel pendek (MDX) | belum (W2-06) |
| `/privasi` | Kebijakan privasi: form kontak, Turnstile (bila aktif), analitik Umami, jalur pertanyaan data (form + WA, **tanpa alamat email**) | hidup (G-48); copy `content/copy/privasi.ts` |
| `/kontak` | Form lead + WA | hidup (W2-05); `POST /api/lead` → email SMTP ke `info@` (kanal primer, `CONTACT_ENABLED=true` + `SMTP_*`) + webhook opsional `LEAD_WEBHOOK_URL`; tanpa kanal → 503 (G-41, menggantikan G-17); anggaran kirim 20/jam situs + 3/hari per IP (G-42), Cloudflare Turnstile opsional `TURNSTILE_SITE_KEY`+`TURNSTILE_SECRET_FILE` (G-43), jebakan honeypot tidak pernah diteruskan (G-44) |

**Rute hidup dibaca dari `content/rute.ts`** (`RUTE_HIDUP` + `ruteHidup()`/`saringTautan()`/`tautanHidup()`) — satu-satunya sumber; nav, footer, CTA, `app/not-found.tsx`, dan `app/sitemap.ts` semuanya memakainya, jadi menghidupkan `/studi-kasus` atau `/insight` cukup satu baris di berkas itu. Jangan membuat daftar rute kedua. Batas yang perlu diketahui: aturan ini belum dipaksakan mesin (G-23) — tautan literal ke rute mati masih lolos lint/tsc/build.

**Aset SEO sudah ada (W3-01), jangan dibuat ulang:** `app/sitemap.ts` → `/sitemap.xml` (8 `<loc>` dari `RUTE_HIDUP`), `app/robots.ts` → `/robots.txt`, `app/icon.tsx` → favicon, dan delapan `opengraph-image.tsx` (root + `/pricing` + `/tentang` + `/kontak` + `/privasi` + 3 `/produk/*`) → kartu OG 1200×630 lewat `components/og/`. Fontnya di `assets/fonts/`, bukan `public/`. Semua URL absolut (metadataBase, canonical, og:url, kartu OG, sitemap, robots) mengikuti env `SITE_URL` saat request (`lib/site.ts`) — tidak ada domain hard-coded. `/favicon.ico` sendiri tetap 404 (Next melarang favicon dirender kode) — keputusan menunggu owner di W3-01.

## Backlog sprint (kerjakan berurutan)

- **W1 — Struktur & copy:** finalisasi copywriting semua halaman di `content/`, layout + nav + footer, halaman beranda utuh.
- **W2 — Semua halaman:** produk ×3, pricing, studi kasus, tentang, kontak (form → `/api/lead` → email SMTP primer + webhook opsional (G-41) + link WA; **bukan** `mailto:` — ADR 2026-08-24 melarang alamat email terbit ke HTML), insight (MDX list + detail).
- **W3 — Poles & rilis:** SEO (metadata per halaman, sitemap.xml, robots, OG image), Umami, aksesibilitas, uji mobile, deploy VPS (Traefik) + domain.

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
- **Commit**: Conventional Commits (feat/fix/chore/docs/ci/sec). **Rilis**: SemVer; tag `vX.Y.Z` (= `package.json` + heading CHANGELOG) → CI build + scan + smoke test → push `ghcr.io/bima-creative-tech/bct-website:X.Y.Z` (main → `:sha-<12>`); tag hanya setelah owner konfirmasi.
- **Keamanan**: baca `SECURITY.md`; CSP ber-nonce di `proxy.ts`/`lib/csp.ts`, header statis di `next.config.ts`, dan pola `/api/lead` (zod + honeypot + rate limit + anggaran kirim + Turnstile opsional) adalah baseline — jangan diturunkan.
- **Keputusan penting** dicatat di `docs/decisions.md` (ADR mini) pada sesi yang sama.
- Gerbang konfirmasi owner: deploy production, perubahan harga/pricing, dependency baru, perubahan CI/Docker, dan hal yang menyentuh data pribadi.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
