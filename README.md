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
| `CONTACT_ENABLED` | tidak (default `false`) | `true` → kanal **email** form `/kontak` aktif (kanal primer, ADR 2026-09-26 G-41); semua `SMTP_*` di bawah wajib — dicek saat boot, gagal → container exit 1. Penerima = konstanta server-only `lib/lead-recipient.ts` (tidak pernah terbit ke klien; dijaga `check-pii.mjs`) |
| `SMTP_HOST`, `SMTP_PORT` | bila form aktif | port default `587`; `465` = TLS implisit, port lain STARTTLS **wajib** (sertifikat selalu diverifikasi) |
| `SMTP_USER`, `SMTP_FROM_ADDRESS` | bila form aktif | akun SMTP & alamat pengirim (From); Reply-To = kontak pengunjung hanya bila ia email sah |
| `SMTP_PASSWORD_FILE` | bila form aktif | **path** file password (secret mount read-only, uid 1001), bukan password; dibaca saat kirim, tidak pernah di-log |
| `LEAD_WEBHOOK_URL` | tidak | Kanal **tambahan** opsional. Email aktif → sukses hanya bila email terkirim (webhook gagal dicatat, tidak fatal); hanya webhook → sukses bila webhook 2xx; email mati DAN webhook kosong → `/api/lead` sengaja membalas **503** (ADR 2026-08-25). Wajib `https://` dan tujuan milik BCT. **Catatan:** template compose infra belum meneruskan `LEAD_WEBHOOK_URL` |
| `TURNSTILE_SITE_KEY` | tidak (berpasangan) | Site key widget **Cloudflare Turnstile** (G-43) — publik, tapi sengaja env **server** (bukan `NEXT_PUBLIC_*`): dibaca saat request dan dioper ke form `/kontak` sebagai prop, jadi satu image bisa melayani staging & production dengan widget berbeda. Kosong bersama `TURNSTILE_SECRET_FILE` → Turnstile mati, form seperti sebelumnya. Hanya salah satu terisi → container **exit 1**. Aktif → CSP menambah `https://challenges.cloudflare.com` di `script-src` dan `frame-src` |
| `TURNSTILE_SECRET_FILE` | tidak (berpasangan) | **Path** file berisi secret key Turnstile (secret mount read-only, uid 1001), pola sama dengan `SMTP_PASSWORD_FILE`; dicek terbaca & tidak kosong saat boot (gagal → exit 1), dibaca lagi saat verifikasi, tidak pernah di-log. Kunci UJI Cloudflare (`1x…/2x…/3x…AA`) memunculkan peringatan boot |
| `UMAMI_SCRIPT_URL` | tidak (berpasangan) | URL lengkap skrip tracker Umami self-host, mis. `https://analytics.bimacreative.tech/<nama>.js` (nama berkas boleh kustom). Wajib `https`, tanpa kredensial/query/fragment, bukan akar domain. Dibaca saat **request** (G-47; kontrak provisional infra plan 11, nama di `lib/umami.ts`). Aktif → root layout merender `<script defer nonce data-website-id data-domains=<host SITE_URL> data-do-not-track="true">` dan CSP menambah origin skrip di `script-src` + `connect-src`. Kosong bersama `UMAMI_WEBSITE_ID` → nol skrip, CSP tanpa tambahan |
| `UMAMI_WEBSITE_ID` | tidak (berpasangan) | UUID website di Umami (per lingkungan: staging dan production sebaiknya berbeda, atau staging dikosongkan). Hanya salah satu dari pasangan ini terisi, atau nilai tidak sah → container **exit 1** (log hanya nama variabel) |

Keterangan lengkap di `.env.example`. Tidak ada secret di `NEXT_PUBLIC_*` (boot gagal bila namanya mirip secret).

Provisioning form kontak = `provision-web-client.sh … --contact` (memuat `templates/web-client/docker-compose.contact.yml`: `CONTACT_ENABLED=true`, `SMTP_*`, secret `./secrets/smtp_password.secret` owner 1001:1001 mode 0400). Sejak infra `07bb35b` (2026-09-26) router rate limit `contact` Traefik juga mencocokkan `POST /api/lead` (5/menit/IP, burst 5), dan template meneruskan `LEAD_WEBHOOK_URL` opsional (`--lead-webhook <https-url>`). **Tindak lanjut infra yang tersisa:** meneruskan `TURNSTILE_SITE_KEY` + secret `TURNSTILE_SECRET_FILE` (G-43).

**Tindak lanjut infra Turnstile (G-43, belum dikerjakan — repo infra tidak disentuh dari sini):** `templates/web-client/docker-compose.contact.yml` perlu (1) meneruskan env `TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_FILE=/run/secrets/turnstile_secret`, dan (2) me-mount secret `./secrets/turnstile_secret.secret` (owner 1001:1001, mode 0400) seperti `smtp_password`. Keduanya harus hadir bersamaan atau tidak sama sekali — satu tanpa yang lain membuat container exit 1. Owner membuat widget Turnstile di dashboard Cloudflare untuk hostname `bct.staging.bimacreative.tech` (lalu domain production), mode **Managed**; server memeriksa `hostname` jawaban siteverify = host `SITE_URL` dan `action` = `kontak`.

**Anggaran kirim (G-42):** `/api/lead` meneruskan paling banyak **20 kiriman/jam situs (ledakan 8)** dan **3/hari per IP** — di bawah batas mailbox `info@` (30/jam, ledakan 10). Lewat anggaran → 503 + arahan WhatsApp. Angka di `app/api/lead/batas.ts` (`ANGGARAN_KIRIM`); in-memory per container, restart = penuh lagi.

### Syarat keamanan yang masih berlaku

- **Rate limit `/api/lead` memercayai entri `X-Forwarded-For` paling kanan** karena Traefik (entrypoint tanpa `trustedIPs`) membuang header kiriman klien dan menuliskan alamat soket sendiri. Karena itu container **tidak boleh** diberi port publik tanpa Traefik di depannya — tanpa hop tepercaya penyerang bisa memilih ember rate limit-nya sendiri (terbukti audit G-05). Jalur lama `VERCEL=1` sudah dibuang. Batasnya per container; replika > 1 butuh penyimpanan bersama (G-16).
- **`Host` asli wajib diteruskan** ke container (Traefik `passHostHeader` bawaan = ya). `/api/lead` hanya mengenali situsnya dari `Host` (`X-Forwarded-Host` sengaja diabaikan sejak G-20); `Host` yang salah (alamat upstream, atau membawa port default `:443`) membuat **form mati untuk semua pengunjung** (403).

© PT Bima Creative Tech. Seluruh hak cipta — bukan open source.
