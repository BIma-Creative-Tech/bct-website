# bct-website

Website resmi PT Bima Creative Tech (BCT) — company profile, katalog produk, dan pricing.

- **Mulai dari `CLAUDE.md`** — seluruh konteks, design system, backlog, dan aturan kerja ada di sana (repo ini didesain untuk dikerjakan dengan Claude Code).
- Konteks bisnis: `docs/flight-plan.md` dan `docs/build-plan.md`.
- Data produk/harga/kontak: `content/site.ts` (satu-satunya sumber kebenaran).
- Copy halaman (teks Bahasa Indonesia): `content/copy/`, diimpor lewat barrel `@/content/copy` — angka harga dan kontak tidak diduplikasi di sana.
- Komponen UI bersama (nav, footer, tombol WhatsApp, skip link): `components/`.
- Stack UI referensi platform (sama dengan web-starter): ikon **Iconsax** (`<Icon>`, subset gratis `npm run icons` → `lib/generated/iconsax-icons.json`, otomatis di `npm run build`), gerak **anime.js** (intro hero) + **Motion** (Number Ticker), komponen **21st.dev** (Magic UI, MIT) disalin ke `components/ui-21st/`. Asal-usul & lisensi: `COMPONENTS.md`; keputusan desain/gerak (query ui-ux-pro-max): `docs/design.md`.
- Rute yang boleh ditautkan: `content/rute.ts` (`RUTE_HIDUP`) — satu-satunya sumber rute hidup; nav, footer, CTA, halaman 404, dan `app/sitemap.ts` semuanya membacanya, jadi tidak ada daftar rute kedua.
- Aset yang hanya dipakai saat build: `assets/fonts/` (3 TTF + `LICENSE.txt` OFL) untuk merender kartu OG. Sengaja BUKAN di `public/` — berkas ini tidak boleh dilayani ke pengunjung.
- SEO dibangkitkan kode, bukan berkas statis: `app/sitemap.ts` → `/sitemap.xml`, `app/robots.ts` → `/robots.txt`, `app/icon.tsx` → favicon, dan tujuh `opengraph-image.tsx` → kartu OG 1200×630. (`/favicon.ico` sendiri tetap 404: Next melarang favicon dirender kode — lihat W3-01 di `docs/checklist.md`.)

## Menjalankan

Node **24** (`engines` `>=24 <25`), semua dependency di-pin versi persis. Host VPS tidak punya Node — pakai container (repo di-mount), seperti referensi platform `/opt/src/web-starter`:

```bash
docker run --rm -v "$PWD:/app" -w /app node:24.21.0-bookworm-slim sh -c \
  'npm ci && npm run icons && npm run lint && npm run typecheck && npm test && npm run build'
# dev server
docker run --rm -it -v "$PWD:/app" -w /app -p 127.0.0.1:3000:3000 -e SITE_URL=http://localhost:3000 \
  node:24.21.0-bookworm-slim npm run dev -- -H 0.0.0.0
```

Aktifkan hook gitleaks sekali per clone: `git config core.hooksPath .githooks` (butuh Docker).

## Deploy (VPS di belakang Traefik — ADR 2026-09-26)

Situs self-host di VPS platform, **bukan Vercel**. Alurnya:

1. CI (`.github/workflows/ci.yml`) membangun image, memindainya (Trivy HIGH/CRITICAL), menjalankan smoke test kontrak, lalu push ke **`ghcr.io/bctech-adm/bct-website`** — `:sha-<12>` untuk `main`, `:X.Y.Z` untuk tag `vX.Y.Z` (harus sama dengan `package.json` dan tercatat di CHANGELOG). Tidak ada tag `latest`.
2. Repo infra memprovisikan container + router Traefik:
   ```bash
   /opt/infra/scripts/provision-web-client.sh bct staging --host bct.staging.bimacreative.tech \
     --image ghcr.io/bctech-adm/bct-website:<X.Y.Z>        # usulan host staging
   /opt/infra/scripts/provision-web-client.sh bct prod --host <domain final> --image ghcr.io/bctech-adm/bct-website:<X.Y.Z> [--www]
   ```
   Skrip merender `templates/web-client/docker-compose.yml` (network `web-edge`, tanpa port publik, read-only + tmpfs, uid 1001, `cap_drop: ALL`, limit 256 MB/0,5 CPU/128 pids) dan router Traefik (`crowdsec` → `security-headers` → rate limit; TLS Let's Encrypt). Runbook: `infra/docs/runbooks/web-client-onboarding.md`. Deploy production = gerbang konfirmasi owner (W3-04).
3. `docker-compose.yml` di repo ini **hanya untuk uji lokal** (hardening yang sama, port hanya `127.0.0.1:3000`).

### Kontrak container

| Item | Nilai |
|---|---|
| Port | 3000 (`HOSTNAME=0.0.0.0`) — hanya dijangkau Traefik, TIDAK boleh diterbitkan publik |
| Health | `GET /api/health` → 200 `{"status":"ok"}` (HEALTHCHECK image & compose) |
| User | uid:gid 1001:1001 |
| Filesystem | rootfs read-only; writable hanya `/tmp` dan `/app/.next/cache` (tmpfs; cache optimasi `next/image`) |
| Header | CSP ber-nonce dikirim aplikasi (`proxy.ts`) — Traefik tidak menyetel CSP. HSTS/nosniff/frame/referrer/permissions dari middleware `security-headers` Traefik; aplikasi juga mengirim nosniff/frame/referrer/permissions/COOP (bukan HSTS) |
| Host & IP | Traefik meneruskan `Host` asli (dipakai pagar Origin `/api/lead`) dan menulis ulang `X-Forwarded-For`/`X-Real-Ip` dari alamat soket (dipakai rate limit) |

### Env

| Env | Wajib | Keterangan |
|---|---|---|
| `SITE_URL` | ya | URL publik kanonik tanpa slash akhir. Sumber metadataBase, canonical, `og:url`, kartu OG, `sitemap.xml`, `robots.txt`. Dicek saat boot — kosong/tidak sah → container exit 1. Host berlabel `staging` atau localhost → `<meta name="robots" content="noindex, nofollow">` + robots `Disallow: /` |
| `LEAD_WEBHOOK_URL` | agar form berfungsi | Kosong → `/api/lead` sengaja membalas **503** dan form menampilkan error jujur (ADR 2026-08-25). Wajib `https://` dan tujuan milik BCT (data pribadi pengunjung melintas ke sana). **Catatan:** template compose infra saat ini hanya meneruskan `SITE_URL` + `CONTACT_ENABLED` — `LEAD_WEBHOOK_URL` belum ikut diteruskan (keputusan owner/infra, lihat G-12) |
| `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_ID` | tidak | Dibaca saat **build**. Origin https dari `SRC` otomatis diizinkan CSP; skrip wajib lewat `next/script` (nonce) |

Keterangan lengkap di `.env.example`. Tidak ada secret di `NEXT_PUBLIC_*` (boot gagal bila namanya mirip secret).

### Syarat keamanan yang masih berlaku

- **Rate limit `/api/lead` memercayai entri `X-Forwarded-For` paling kanan** karena Traefik (entrypoint tanpa `trustedIPs`) membuang header kiriman klien dan menuliskan alamat soket sendiri. Karena itu container **tidak boleh** diberi port publik tanpa Traefik di depannya — tanpa hop tepercaya penyerang bisa memilih ember rate limit-nya sendiri (terbukti audit G-05). Jalur lama `VERCEL=1` sudah dibuang. Batasnya per container; replika > 1 butuh penyimpanan bersama (G-16).
- **`Host` asli wajib diteruskan** ke container (Traefik `passHostHeader` bawaan = ya). `/api/lead` hanya mengenali situsnya dari `Host` (`X-Forwarded-Host` sengaja diabaikan sejak G-20); `Host` yang salah (alamat upstream, atau membawa port default `:443`) membuat **form mati untuk semua pengunjung** (403).

© PT Bima Creative Tech. Seluruh hak cipta — bukan open source.
