# COMPONENTS.md — komponen pihak ketiga yang DISALIN ke repo

Aturan (ADR 2026-09-26 "Stack UI referensi", sama dengan web-starter): komponen disalin (bukan
dependency runtime), lisensi dan asal-usul dicatat di sini, komponen tanpa lisensi jelas
**ditolak**. Tidak ada request runtime ke 21st.dev.

## 21st.dev (`components/ui-21st/`)

Disalin 2026-09-26 dari referensi platform `/opt/src/web-starter` (`src/components/ui-21st/`,
commit `e216fee`), yang provenance-nya sudah diverifikasi di `web-starter/COMPONENTS.md`:

- Registry 21st.dev (`https://21st.dev/r/<author>/<component>`) mengembalikan
  `403 {"error":"Authentication required"}` (diverifikasi web-starter 2026-09-25) dan kode di
  halaman komponen menunjuk storage privat. **Lisensi & author** diambil dari data halaman publik
  21st.dev; **kode** dari repo upstream yang ditunjuk halaman tersebut (Magic UI, author sama).
- Upstream: <https://github.com/magicuidesign/magicui> · commit
  `d7207e5692d14c00dceafa8488d6d01f197fa0e4` (2026-09-20) · lisensi **MIT**
  (`Copyright (c) Magic UI`) · repo aktif (±22 rb bintang, tidak diarsipkan).

| Komponen | Halaman 21st.dev | Author (21st.dev) | Lisensi (21st.dev → upstream) | Path upstream @ commit | Dependency (21st.dev → dipakai di sini) | File lokal | Dipakai di |
|---|---|---|---|---|---|---|---|
| Marquee | https://21st.dev/@dillionverma/components/marquee | Dillion Verma (`dillionverma`) | `mit` → MIT | `apps/www/registry/magicui/marquee.tsx` | tidak ada; keyframes `marquee` → `app/globals.css` (`@theme inline`) | `marquee.tsx` | beranda: pita teknologi |
| Bento Grid | https://21st.dev/@dillionverma/components/bento-grid | Dillion Verma | `mit` → MIT | `apps/www/registry/magicui/bento-grid.tsx` | `@radix-ui/react-icons` + `shadcn/button` → **diganti** `<Icon>` Iconsax + `next/link` (tanpa dependency baru) | `bento-grid.tsx` | beranda: tiga lini produk |
| Number Ticker | https://21st.dev/@dillionverma/components/number-ticker | Dillion Verma | `mit` → MIT | `apps/www/registry/magicui/number-ticker.tsx` | `framer-motion`/`motion` → `motion@13.4.3` (import dinamis di `<ScrollEnhancer>`) | `number-ticker.tsx` | beranda: statistik hero + rekam jejak; /tentang: rekam jejak (lewat `components/angka-statistik.tsx`) |
| Animated Grid Pattern | https://21st.dev/@dillionverma/components/animated-grid-pattern | Dillion Verma | `mit` → MIT | `apps/www/registry/magicui/animated-grid-pattern.tsx` | `framer-motion`/`motion` → hook kecil lokal `lib/use-motion-prefs.ts` | `animated-grid-pattern.tsx` + `animated-grid-squares.tsx` | hero beranda, `<HeroHalaman>` (produk ×3, pricing, tentang, kontak) |

Ditolak/tidak dipakai: **Border Beam** (MIT) — menganimasikan `offset-distance` (bukan
transform/opacity). Testimoni/logo-wall (pola Marquee di web-starter) — BCT tidak punya konten
nyata untuknya (dilarang mengarang).

### Perubahan terhadap upstream (ringkas; detail di header tiap file)

Semua perubahan web-starter (lihat `web-starter/COMPONENTS.md`) ikut terbawa, ditambah adaptasi BCT:

- **Semua**: warna → token BCT saja (`bg-surface`, `border-line`/`stroke-line`, `text-ink`,
  `text-ink-2`, `text-accent`, `accent-soft`) — satu aksen merah, ikut dark mode & `.tema-gelap`;
  `cn` (clsx + tailwind-merge) → `kelas()` dari `components/styles.ts` (tanpa dependency baru;
  konsekuensinya jangan meneruskan kelas yang bentrok — durasi Marquee lewat prop `durasi`).
- **Marquee**: salinan ke-2..n `aria-hidden`; jeda lewat `MarqueePauseButton`
  (`components/sections/marquee-pause-button.tsx`, label dari copy), hover, dan fokus keyboard
  (WCAG 2.2.2); reduced motion → mati, satu salinan, bisa digulir. Varian vertikal dibuang.
- **Bento Grid**: seluruh kartu satu tautan (target sentuh besar, fokus terlihat) menggantikan
  CTA yang hanya muncul saat hover; slot `children` untuk paket masuk + harga dari `content/site.ts`;
  gerak hover = `kartuInteraktif`; `<ul>/<li>` semantik.
- **Number Ticker**: server component yang merender NILAI AKHIR (tanpa JS/crawler/reduced motion
  melihat angka benar), angka animasi `aria-hidden` + `sr-only`, locale `id-ID`; spring upstream
  (damping 60, stiffness 100) dijalankan `<ScrollEnhancer>` hanya bila angka masih di bawah layar
  saat idle. Nilai diurai dari teks `content/site.ts` oleh `lib/angka.ts` (diuji).
- **Animated Grid Pattern**: grid SVG server-rendered + kotak berkedip sebagai elemen HTML dengan
  CSS keyframes opacity (compositor), mulai saat idle, jeda di luar viewport, hanya
  `(min-width: 768px)`; reduced motion → grid statis.

## Iconsax (`iconsax@0.1.1`, MIT, <https://github.com/iconsax/iconsax-npm>)

Web component resmi `<iconsax-icon>`. Hanya ikon **gratis**. Subset SVG yang dipakai
(`components/icon-names.ts`) diekstrak dari data paket oleh `scripts/iconsax-subset.mjs` →
`lib/generated/iconsax-icons.json` (alasan: loader data bawaan paket rusak di Turbopack — lihat
docs/design.md §6). Paket komunitas `iconsax-react`/`iconsax-reactjs` ditolak.

## Library animasi (dependency runtime, bukan salinan)

`motion@13.4.3` (MIT, <https://github.com/motiondivision/motion>) dan `animejs@4.5.0` (MIT,
<https://github.com/juliangarnier/anime>) — versi & integritas lock identik dengan web-starter.
