# bct-website — Website resmi PT Bima Creative Tech (BCT)

Website company profile + aset jualan BCT. **Tujuan tunggal halaman apa pun: mengubah pengunjung menjadi chat WhatsApp.** Semua keputusan desain/konten diukur terhadap tujuan itu.

## Konteks bisnis (baca dulu)

- BCT = studio IT solo (Ade), produk: **Bima Insight** (BOT Agent baca database + dashboard interaktif, SaaS), **Odoo** (implementasi paket UMKM + retainer Odoo Care + frontend Next.js premium), **Web & Apps** (paket company profile + AI chat, custom development selektif).
- Konteks lengkap ada di `docs/flight-plan.md` (strategi bisnis 12 bulan) dan `docs/build-plan.md` (rencana development 3 produk). **Baca keduanya sebelum menulis copy atau menambah halaman.**
- Kapasitas dev pemilik hanya 5–10 jam/minggu — jangan tambah kompleksitas yang butuh maintenance (CMS eksternal, backend database, auth). Situs ini statis/ISR.

## Stack

- Next.js (App Router) + TypeScript strict + Tailwind CSS v4 (`@tailwindcss/postcss`).
- Konten = file TS/MDX di `content/` — TIDAK ada CMS. Data produk & harga di `content/site.ts` adalah **satu-satunya sumber kebenaran** untuk nama paket, harga, dan CTA; komponen tidak boleh hardcode angka harga.
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
| `/` | Beranda: proposisi + 3 produk + bukti + CTA WA | scaffold |
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
