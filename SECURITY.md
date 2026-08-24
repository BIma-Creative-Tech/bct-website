# Kebijakan Keamanan — bct-website

## Praktik yang diberlakukan (dijaga oleh agent security-auditor & CI)

1. **Headers**: CSP, HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy — didefinisikan di `next.config.ts`. Pelonggaran apa pun butuh justifikasi tertulis + persetujuan owner.
2. **Input publik**: semua API route memvalidasi dengan zod, method-restricted, rate-limited, dan form publik memakai honeypot. Data lead minimal (nama, kontak, pesan) — selaras UU PDP No. 27/2022.
3. **Secrets**: tidak pernah di repo. `.env.example` mendaftar semua variabel; gitleaks berjalan di CI pada setiap push/PR.
4. **Dependency**: `npm audit --omit=dev --audit-level=high` di CI — temuan high/critical memblokir merge. Dependency baru wajib berjustifikasi di PR.
5. **Docker**: multi-stage, non-root (`USER node`), standalone output, HEALTHCHECK, `read_only` + `no-new-privileges` di compose.
6. **CI**: permission `GITHUB_TOKEN` minimal (`contents: read`; `packages: write` hanya di release).
7. **Analytics**: Umami self-host saja — tidak ada tracker pihak ketiga.

## Melaporkan kerentanan

Kirim detail ke email resmi BCT (lihat `content/site.ts`) dengan subjek "SECURITY". Mohon jangan membuka issue publik untuk kerentanan yang belum diperbaiki. Target respons awal: 3 hari kerja.
