# bct-website

Website resmi PT Bima Creative Tech (BCT) — company profile, katalog produk, dan pricing.

- **Mulai dari `CLAUDE.md`** — seluruh konteks, design system, backlog, dan aturan kerja ada di sana (repo ini didesain untuk dikerjakan dengan Claude Code).
- Konteks bisnis: `docs/flight-plan.md` dan `docs/build-plan.md`.
- Data produk/harga/kontak: `content/site.ts` (satu-satunya sumber kebenaran).

## Menjalankan

```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploy

Vercel (production branch: `main`). Env yang dibutuhkan: `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_ID` (opsional sampai Umami terpasang).

© PT Bima Creative Tech. Seluruh hak cipta — bukan open source.
