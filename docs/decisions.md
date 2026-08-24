# Catatan Keputusan (ADR mini)

Format: tanggal — keputusan — alasan — alternatif yang ditolak. Maksimal ±5 baris per entri. Dijaga oleh agent docs-keeper.

- **2026-08-24 — Multi-agent dengan lead orchestrator.** Semua pekerjaan multi-langkah lewat agent `lead` yang mendelegasikan ke spesialis dan menjaga checklist. Alasan: owner solo 5–10 jam/minggu butuh proses yang konsisten tanpa mengandalkan ingatan. Ditolak: bekerja ad-hoc tanpa pembagian peran.
- **2026-08-24 — Status ✅ hanya dari konfirmasi owner.** Agent maksimal menaikkan status ke 🟨 KONFIRMASI-OWNER. Alasan: owner adalah quality gate terakhir dan harus tahu persis apa yang berubah. Ditolak: auto-done oleh QA.
- **2026-08-24 — Governance check di CI.** Perubahan kode tanpa update CHANGELOG + checklist = CI merah. Alasan: dokumentasi & monitoring harus otomatis tertagih, bukan mengandalkan disiplin. Ditolak: konvensi tanpa penegakan.
- **2026-08-24 — Deploy utama Vercel, Docker sebagai jalur self-host/rilis versi.** Image GHCR dibuat per tag rilis untuk versioning yang bisa diaudit. Ditolak: full VPS-only (maintenance lebih berat untuk situs marketing).
- **2026-08-24 — Dependency zod ditambahkan.** Untuk validasi input API lead. Justifikasi: standar industri, dipakai juga di nextjs-odoo.
