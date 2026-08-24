# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/); versi mengikuti [SemVer](https://semver.org/lang/id/).
Aturan proyek: setiap perubahan kode wajib tercatat di [Unreleased] pada commit yang sama (ditegakkan CI oleh `scripts/check-governance.mjs`).

## [Unreleased]

### Added
- Scaffold awal: CLAUDE.md, design tokens, `content/site.ts`, halaman beranda, docs plan.
- Tim multi-agent `.claude/agents/` (lead, frontend-builder, content-writer, security-auditor, devops-engineer, qa-reviewer, docs-keeper).
- Security: headers (CSP/HSTS/dll.) di `next.config.ts`, endpoint lead `/api/lead` (zod + honeypot + rate limit), SECURITY.md.
- Docker: Dockerfile multi-stage non-root + docker-compose + .dockerignore.
- CI/CD: workflow CI (lint, build, audit, gitleaks, governance check, docker build) dan Release (tag → GHCR).
- Governance: docs/checklist.md dengan gerbang konfirmasi owner, docs/decisions.md, CHANGELOG ini.
