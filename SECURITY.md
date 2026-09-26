# Kebijakan Keamanan — bct-website

## Praktik yang diberlakukan (dijaga oleh agent security-auditor & CI)

1. **Headers**: CSP ber-nonce per request (`proxy.ts` + `lib/csp.ts`: `script-src 'self' 'nonce-…' 'strict-dynamic'`, tanpa `'unsafe-inline'`; `'unsafe-eval'` hanya `next dev`), X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP di `next.config.ts`; HSTS di middleware `security-headers` Traefik (repo infra). Pelonggaran apa pun butuh justifikasi tertulis + persetujuan owner. Guard `scripts/check-csp.mjs` memeriksa header yang benar-benar dikirim image di smoke test CI.
2. **Input publik**: semua API route memvalidasi dengan zod, method-restricted, rate-limited (per IP = entri `X-Forwarded-For` paling kanan yang ditulis Traefik — container wajib tanpa port publik), dan form publik memakai honeypot. Data lead minimal (nama, kontak, pesan) — selaras UU PDP No. 27/2022.
3. **Secrets**: tidak pernah di repo. `.env.example` mendaftar semua variabel; gitleaks berjalan di CI (full history) dan di hook `.githooks/pre-commit`; Semgrep + Trivy (fs, config, image) memblokir temuan HIGH/CRITICAL. Guard `scripts/check-pii.mjs` memfailkan build bila email/lokasi owner terbit ke artefak klien.
4. **Dependency**: `npm audit --omit=dev --audit-level=high` di CI — temuan high/critical memblokir merge. Dependency baru wajib berjustifikasi di PR.
5. **Docker**: multi-stage, base `node:24.21.0-alpine` di-pin digest, uid 1001 non-root, npm dibuang dari runner, standalone output, HEALTHCHECK `/api/health`; dijalankan read-only + tmpfs, `cap_drop: ALL`, `no-new-privileges`, limit mem/cpu/pids (template infra), di belakang Traefik tanpa port publik.
6. **CI**: permission `GITHUB_TOKEN` minimal (`contents: read`; `packages: write` hanya job `image`), semua action di-pin SHA, image push ke GHCR hanya setelah semua pemeriksaan + smoke test hijau.
7. **Analytics**: Umami self-host saja — tidak ada tracker pihak ketiga.

## Melaporkan kerentanan

Kirim detail ke email resmi BCT (lihat `content/site.ts`) dengan subjek "SECURITY". Mohon jangan membuka issue publik untuk kerentanan yang belum diperbaiki. Target respons awal: 3 hari kerja.
