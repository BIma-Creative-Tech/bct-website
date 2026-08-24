# bct-website

Website resmi PT Bima Creative Tech (BCT) — company profile, katalog produk, dan pricing.

- **Mulai dari `CLAUDE.md`** — seluruh konteks, design system, backlog, dan aturan kerja ada di sana (repo ini didesain untuk dikerjakan dengan Claude Code).
- Konteks bisnis: `docs/flight-plan.md` dan `docs/build-plan.md`.
- Data produk/harga/kontak: `content/site.ts` (satu-satunya sumber kebenaran).
- Copy halaman (teks Bahasa Indonesia): `content/copy/`, diimpor lewat barrel `@/content/copy` — angka harga dan kontak tidak diduplikasi di sana.
- Komponen UI bersama (nav, footer, tombol WhatsApp, skip link): `components/`.

## Menjalankan

```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploy

Vercel (production branch: `main`). Env yang dibutuhkan (keterangan lengkap di `.env.example`):

- `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_ID` — opsional sampai Umami terpasang.
- `LEAD_WEBHOOK_URL` — **wajib** agar form kontak berfungsi. Selama kosong, `/api/lead` sengaja membalas `503` dan form menampilkan error alih-alih sukses palsu. Wajib `https://` dan menunjuk tujuan milik BCT: nama, nomor WA/email, dan isi pesan pengunjung melintas ke sana.

Dua syarat keamanan dari audit 2026-08-25 (dilacak sebagai G-12, W3-04, dan G-16 di `docs/checklist.md`):

- **Jangan pernah set `VERCEL=1` secara manual** di luar platform Vercel. Flag itu membuat `/api/lead` memercayai header `x-vercel-forwarded-for`; auditor membuktikan 2.000 request berheader palsu lolos 100% saat flag itu aktif di luar edge Vercel. Di Vercel asli edge menimpa header tersebut sehingga aman.
- **Deploy sebaiknya di belakang edge Vercel**, bukan image standalone yang origin-nya diekspos langsung. Pada mode self-host (`docker-compose.yml` memetakan `3000:3000` tanpa reverse proxy) seluruh trafik berbagi satu ember rate limit 30/menit per instans — ~30 request semenit dari satu sumber mengunci form untuk semua pengunjung lain. Perbaikan sesungguhnya butuh penyimpanan rate limit bersama, menunggu keputusan owner di G-16.

Sebelum deploy production: ganti `site.domain` di `content/site.ts` dari `http://localhost:3000` ke domain final — canonical dan OG image mengikuti nilai itu.

© PT Bima Creative Tech. Seluruh hak cipta — bukan open source.
