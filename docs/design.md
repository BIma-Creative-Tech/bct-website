# Keputusan desain — stack UI referensi (bct-website)

Tanggal 2026-09-26 · checklist G-37..G-40 · ADR 2026-09-26 "Stack UI referensi" (`docs/decisions.md`).
Referensi platform: `/opt/src/web-starter` (`docs/design.md`, `COMPONENTS.md`). Panduan: skill
**ui-ux-pro-max** (`/root/.claude/skills/ui-ux-pro-max`, `scripts/search.py`).

**Batas yang tidak ikut berubah:** token, palet merah-krem, dark mode ikut sistem, font Bricolage
Grotesque / Figtree / IBM Plex Mono, nada "tenang, presisi, engineering studio" (CLAUDE.md
§Design system). ui-ux-pro-max dipakai untuk tata letak, gerak, dan UX — **bukan** palet/font.

## 1. Query ui-ux-pro-max (nyata) dan keputusannya

| Query | Hasil utama | Keputusan |
|---|---|---|
| `"software engineering studio B2B ERP dashboard SME" --design-system --variance 4 --motion 4 --density 4 -p BCT` | Pola **Hero + Features + CTA** (CTA di hero + bawah; "disable hero parallax under reduced motion and render its static final state"); gaya Glassmorphism; palet biru `#2563EB` + oranye `#EA580C`; font Plus Jakarta Sans; motion "Stagger List" 300–450 ms; avoid "excessive animation + dark mode by default" | **Pola dipakai** (struktur beranda sudah sesuai). **Palet & font ditolak** (identitas BCT dikunci ADR 2026-09-24). Glassmorphism hanya yang sudah ada (header blur, kartu `bg-surface/80`). Stagger dipakai untuk intro hero (90 ms/baris) dan reveal kartu (60 ms/butir, maks 5). Dark tetap ikut sistem, bukan default |
| `"bento grid" --domain style` | Bento Box Grid: modular cards, varied spans, rounded 16–24 px, hover scale halus, responsive 4→2→1 | Tiga lini produk beranda = Bento Grid 21st.dev; span bervariasi (lg: kartu pertama 2 baris, dua lainnya lebar 2 kolom); radius `rounded-2xl` yang sudah ada; hover = `kartuInteraktif` |
| `"minimal swiss engineering precise" --domain style` | Minimalism & Swiss: grid-based, satu aksen, subtle hover 200–250 ms, no unnecessary decoration | Menguatkan nada "engineering studio": grid pattern (Animated Grid Pattern) sebagai tekstur latar hero, satu aksen merah, dekorasi dibatasi |
| `"reduced motion" --domain ux` | Respect prefers-reduced-motion (High); **Excessive Motion: animate 1–2 key elements per view**; Motion sensitivity: no parallax/scroll-jacking | Semua gerak di balik reduced motion; per view maksimal intro hero + satu gerak ambient; reveal dipicu sekali (bukan terikat posisi gulir) |
| `"continuous animation" --domain ux` | Infinite animation hanya untuk loading, bukan dekorasi (Medium) | Gerak tanpa akhir (blob berdenyut, chip melayang, kotak grid) **mati di < 768px**; titik berdenyut di statistik hero dibuang; marquee bisa dijeda |
| `"auto-playing content pause stop" --domain ux` (retry dari `"marquee carousel pause"` yang 0 hasil) | Auto-rotating content: sediakan play/pause; berhenti saat fokus/hover dan saat reduced motion | Marquee: tombol Jeda/Putar (WCAG 2.2.2), jeda saat hover & fokus, reduced motion → diam + bisa digulir |
| `"number counter statistics animation" --domain ux` | Number formatting (pemisah ribuan); continuous animation warning | Number Ticker sekali saat terlihat, format `id-ID`, SSR = nilai akhir |
| `"scroll reveal stagger" --domain ux` | Smooth scroll anchor; motion sensitivity (no scroll-jacking) | Reveal = IntersectionObserver sekali-jalan (bukan scroll-linked); `scroll-behavior: smooth` tetap hanya tanpa reduced motion |
| `"animation duration timing" --domain ux` | Pakai token gerak bersama, jangan satu cutoff universal | Durasi dibakukan: intro 800–1100 ms `outExpo`, reveal 600 ms `cubic-bezier(.22,1,.36,1)`, hover 300 ms (sudah ada) |
| `"layout shift reserve space" --domain ux` | Reserve space; no content jumping | Ikon dalam kotak ukuran tetap (render sebelum web component aktif → CLS 0); Number Ticker merender angka akhir, ticker `tabular-nums` |
| `"stagger" --domain gsap` | Stagger kecil (≤ 0,1 dtk/butir); jangan overshoot `back.out` di UI informasional | Stagger 60–90 ms, easing `outExpo` tanpa overshoot |
| `"decorative icon aria hidden" --domain icons` | Ikon dekoratif di samping teks `aria-hidden`; ikon bermakna perlu teks alternatif; satu keluarga ikon per permukaan | Semua ikon Iconsax dekoratif (`aria-hidden` otomatis di `<Icon>`), tombol ikon-saja (menu mobile) tetap punya `sr-only`; satu keluarga ikon (Iconsax) — logo merek boleh tetap |

Skill menyarankan Phosphor/Heroicons sebagai pustaka ikon; **ditolak** — keputusan owner = Iconsax
(stack referensi platform).

## 2. Penerapan per halaman

| Halaman | Perubahan |
|---|---|
| `/` beranda | Hero foto `.tema-gelap`: intro anime.js (badge, h1, paragraf, tombol, statistik bergerak angkat bertahap — teks tidak pernah disembunyikan); Animated Grid Pattern di atas selubung, dimask ke sisi kanan (area foto) → teks tetap di atas selubung 0,90/0,94 (kontras G-28 tidak berubah); statistik `30+ / 10+ / 10+ tahun` via Number Ticker; chip bidang kerja = ikon Iconsax. **Pita teknologi** baru (Marquee + tombol jeda) berisi Odoo Community, Next.js, Flutter, PostgreSQL, MySQL — semuanya sudah disebut copy produk. **Produk** → Bento Grid (kartu utuh satu tautan, harga paket masuk dari `content/site.ts`). **Rekam jejak** → `<DaftarBukti detail>` (Number Ticker untuk "10+ tahun"; "KOMDIGI"/"Retail" apa adanya). Penutup → `<BlokCtaPenutup>` |
| `/produk/*` ×3, `/pricing`, `/tentang`, `/kontak` | `<HeroHalaman>`: intro anime.js yang sama + grid pattern (kotak berkedip md+); kartu `DaftarPoin`/`DaftarLangkah`/`DaftarMesin`/`DaftarPaket`/visi-misi/CTA memakai reveal bersama; centang daftar & panah tombol = Iconsax; /tentang rekam jejak via Number Ticker |
| 404 | Kartu tautan bantu memakai reveal; panah Iconsax; mengimpor section langsung (tanpa pulau client hero) |
| Global | Nav: chevron & tombol menu Iconsax; tombol WA mengambang ikon `messages-2`; header scroll-driven kini compositor-only (opacity dua lapisan pseudo) |

Tidak ada konten baru selain `beranda.teknologi` (label pita + label tombol jeda) — ditandai
`[TANYA-OWNER]`. Tidak ada testimoni, logo klien, atau angka karangan.

## 3. Ikon (Iconsax)

Port apa adanya dari web-starter §6: `<Icon>` server component (`data-name` → `name` diaktifkan
`<IconsaxLoader>` saat idle), subset gratis build-time (`scripts/iconsax-subset.mjs` →
`lib/generated/iconsax-icons.json`, 19 ikon × linear/bulk ≈ 38 KB mentah) karena loader bawaan
paket rusak di Turbopack. Tambahan BCT: saat nama ikon berganti di client (menu buka/tutup, tombol
jeda), elemen dipasang ulang lewat `key` — loader hanya mengaktifkan elemen baru. Pilihan nama
diverifikasi visual: `menu` Iconsax berbentuk grid titik → tombol menu memakai
`textalign-justifycenter`; panah "→" lama = `arrow-right-01`; chevron = `arrow-down-02`.
CSP: web component berjalan dengan `script-src` nonce + `strict-dynamic` (dimuat oleh chunk
bernonce) dan atribut style-nya tercakup `style-src 'unsafe-inline'` yang sudah ada sejak G-04 —
**tidak ada pelonggaran CSP**; Playwright mencatat 0 pelanggaran CSP.

## 4. Gerak (motion) & aksesibilitas

| Lapisan | Library | Perilaku | Reduced motion |
|---|---|---|---|
| Intro hero (beranda + `<HeroHalaman>`) | **anime.js 4.5.0** `waapi.animate` + `stagger`, `createScope` (subpath modular, import dinamis, mulai saat idle) | angkat singkat bertahap 90 ms; coretan `<JudulSorot>` digambar `scaleX` (fallback CSS 2,5 dtk) | dilewati |
| Reveal kartu section | CSS animation `muncul-naik` dipicu `<ScrollEnhancer>` (IntersectionObserver, mulai saat idle) | fade + naik 24 px, sekali; hanya elemen yang masih di bawah layar saat idle | tidak dijalankan |
| Angka | Number Ticker — spring **Motion 13.4.3** `animate()` (import dinamis saat terlihat) | hitung naik bila angka di bawah layar saat idle (mis. HP); yang sudah terlihat tidak diubah | nilai akhir |
| Grid latar hero | Animated Grid Pattern (SVG server + kotak CSS opacity) | kotak berkedip hanya ≥ 768px, jeda di luar viewport | grid statis |
| Blob, chip melayang | CSS keyframes (opacity/transform) | hanya ≥ 768px (chip: xl+) | mati |
| Pita teknologi | Marquee CSS (server) + tombol jeda (pulau client) | loop 30 dtk; jeda via tombol/hover/fokus | mati, 1 salinan, bisa digulir |
| Header | CSS scroll-driven (opacity dua pseudo) | padat → kaca dalam 120 px pertama | perubahan opacity saja (bukan gerak) |

**Satu mekanisme reveal** (keputusan): `<ScrollEnhancer>` seperti web-starter, bukan CSS
scroll-driven lama. Alasan: (1) `animation-timeline: view()` hanya jalan di Chromium — Safari/Firefox
tidak melihat apa pun, jadi perilaku situs berbeda per peramban; (2) reveal yang terikat posisi gulir
bergerak maju-mundur mengikuti gulir, dekat dengan pola scroll-jacking yang dihindari ui-ux-pro-max;
(3) Number Ticker membutuhkan pemicu "masuk viewport" yang sama — satu pulau client untuk keduanya.
Beda dari web-starter: reveal memakai CSS *animation*, bukan *transition*, karena `transition`
unlayered menimpa transisi hover Tailwind (`kartuInteraktif`) pada elemen yang sama.

**Dark mode**: tetap mengikuti sistem, tanpa toggle (ADR G-29). web-starter punya toggle; untuk BCT
tidak ada kebutuhan kuat — dicatat sebagai pertanyaan owner saja.

Aksesibilitas yang dijaga: teks hero tidak pernah `opacity: 0`; SSR merender angka final; marquee
dapat dijeda (WCAG 2.2.2) dengan salinan ke-2..n `aria-hidden`; ikon dekoratif `aria-hidden`; kartu
bento = satu tautan dengan `fokusRing`; target sentuh ≥ 44 px (tombol jeda `min-h-11`).

## 5. Verifikasi (2026-09-26, image `bct-website:stage2`, smoke hardened)

- Container `node:24.21.0-bookworm-slim`: `npm ci && npm run icons && npm run lint && npm run
  typecheck && npm test && npm run build` exit 0; 7 berkas uji / 31 uji; `git diff --exit-code
  lib/generated/iconsax-icons.json` bersih; `check-pii.mjs` OK (100 berkas).
- Image read-only, `-u 1001:1001`, `--cap-drop ALL`, no-new-privileges: 7 rute + `/api/health` +
  sitemap + robots = 200, rute acak = 404; `check-csp.mjs` OK 7 path (12 `<script>` bernonce).
- Playwright 1.55 (Chromium), 8 rute × 390/1440 × light/dark + reduced motion: 0 pelanggaran CSP,
  0 error konsol (selain status 404 dokumen rute acak), semua `<iconsax-icon>` aktif, tidak ada
  scroll horizontal, tidak ada elemen tertinggal "armed", marquee `animation-name: marquee`
  (reduced: `none`).
- **Lighthouse 13.5.0 mobile** (lokal, host produksi bersama → varians besar; SEO 69 karena
  `SITE_URL=http://localhost` sengaja `noindex`): lihat baris G-40 di `docs/checklist.md` untuk
  angka. Target ≥ 90 performance **belum tercapai secara konsisten** di host ini; A/B interleaved
  terhadap Stage 1 (b3b2311) tidak menunjukkan regresi yang bisa dibedakan dari derau.
  Aksesibilitas 96: satu-satunya temuan = kontras `--muted` (3,37:1) di footer — sudah tercatat
  W3-08, tidak diubah di sini (token).
