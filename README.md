# bct-website

Website resmi PT Bima Creative Tech (BCT) — company profile, katalog produk, dan pricing.

- **Mulai dari `CLAUDE.md`** — seluruh konteks, design system, backlog, dan aturan kerja ada di sana (repo ini didesain untuk dikerjakan dengan Claude Code).
- Konteks bisnis: `docs/flight-plan.md` dan `docs/build-plan.md`.
- Data produk/harga/kontak: `content/site.ts` (satu-satunya sumber kebenaran).
- Copy halaman (teks Bahasa Indonesia): `content/copy/`, diimpor lewat barrel `@/content/copy` — angka harga dan kontak tidak diduplikasi di sana.
- Komponen UI bersama (nav, footer, tombol WhatsApp, skip link): `components/`.
- Rute yang boleh ditautkan: `content/rute.ts` (`RUTE_HIDUP`) — satu-satunya sumber rute hidup; nav, footer, CTA, halaman 404, dan `app/sitemap.ts` semuanya membacanya, jadi tidak ada daftar rute kedua.
- Aset yang hanya dipakai saat build: `assets/fonts/` (3 TTF + `LICENSE.txt` OFL) untuk merender kartu OG. Sengaja BUKAN di `public/` — berkas ini tidak boleh dilayani ke pengunjung.
- SEO dibangkitkan kode, bukan berkas statis: `app/sitemap.ts` → `/sitemap.xml`, `app/robots.ts` → `/robots.txt`, `app/icon.tsx` → favicon, dan tujuh `opengraph-image.tsx` → kartu OG 1200×630. (`/favicon.ico` sendiri tetap 404: Next melarang favicon dirender kode — lihat W3-01 di `docs/checklist.md`.)

## Menjalankan

```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploy

Vercel (production branch: `main`). Env yang dibutuhkan (keterangan lengkap di `.env.example`):

- `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_ID` — opsional sampai Umami terpasang.
- `LEAD_WEBHOOK_URL` — **wajib** agar form kontak berfungsi. Selama kosong, `/api/lead` sengaja membalas `503` dan form menampilkan error alih-alih sukses palsu. Wajib `https://` dan menunjuk tujuan milik BCT: nama, nomor WA/email, dan isi pesan pengunjung melintas ke sana.

Tiga syarat keamanan dari audit 2026-08-25 dan 2026-08-26 (dilacak sebagai G-12, W3-04, G-16, dan G-20 di `docs/checklist.md`) — semuanya wajib, bukan saran:

- **Jangan pernah set `VERCEL=1` secara manual** di luar platform Vercel. Flag itu membuat `/api/lead` memercayai header `x-vercel-forwarded-for`; auditor membuktikan 2.000 request berheader palsu lolos 100% saat flag itu aktif di luar edge Vercel. Di Vercel asli edge menimpa header tersebut sehingga aman.
- **Deploy sebaiknya di belakang edge Vercel**, bukan image standalone yang origin-nya diekspos langsung. Pada mode self-host (`docker-compose.yml` memetakan `3000:3000` tanpa reverse proxy) seluruh trafik berbagi satu ember rate limit 30/menit per instans — ~30 request semenit dari satu sumber mengunci form untuk semua pengunjung lain. Perbaikan sesungguhnya butuh penyimpanan rate limit bersama, menunggu keputusan owner di G-16.
- **Di belakang reverse proxy, `Host` asli WAJIB diteruskan** — `proxy_set_header Host $host;` di nginx, atau padanannya di Caddy/Traefik. Sejak perbaikan keamanan G-20 membuang `X-Forwarded-Host` (header itu ditulis klien dan terbukti bisa dipakai menambahkan origin ke daftar putih), `/api/lead` hanya mengenali situsnya dari header `Host`. Dengan `proxy_pass` bawaan nginx, `Host` justru menjadi alamat upstream dan host publik hanya tersisa di `X-Forwarded-Host` yang kini sengaja diabaikan. Akibatnya bukan pelemahan melainkan **form kontak mati untuk semua pengunjung** — setiap kiriman dibalas 403. Terukur auditor: `Host: 127.0.0.1:3000` + `X-Forwarded-Host: bct.co.id` + `Origin: https://bct.co.id` → **403**; dan `Host: bct.co.id:443` + `Origin: https://bct.co.id` → **403** juga, karena port ikut dibandingkan apa adanya — jadi jangan teruskan `Host` berikut port default. Vercel tidak terpengaruh (edge-nya mengisi `Host` dengan host publik); yang terpengaruh adalah image GHCR + `docker-compose.yml` di belakang reverse proxy.

Sebelum deploy production: ganti `site.domain` di `content/site.ts` dari `http://localhost:3000` ke domain final — `sitemap.xml`, `robots.txt`, canonical, `og:url`, dan URL kartu OG semuanya mengikuti nilai itu (terukur W3-01: satu perubahan memperbaiki ketujuh `<loc>`, baris `Sitemap:` di robots, dan 30 URL absolut (14 nilai unik) di `<head>` kedelapan rute, menyisakan nol `localhost:3000`).

© PT Bima Creative Tech. Seluruh hak cipta — bukan open source.
