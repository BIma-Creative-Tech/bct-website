/**
 * Governance check (dijalankan CI):
 * Jika ada perubahan kode (app/, components/, content/, lib/, scripts/, tests/, config,
 * proxy.ts, instrumentation.ts, Dockerfile, workflows, hook git)
 * maka CHANGELOG.md dan docs/checklist.md juga harus berubah di push/PR yang sama.
 * Tujuan: dokumentasi & checklist termonitor di SETIAP perubahan.
 */
import { execSync } from "node:child_process";

const base =
  process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}` // PR: bandingkan dengan branch target
    : "HEAD~1"; // push: bandingkan dengan commit sebelumnya

let files = [];
try {
  execSync(`git fetch --quiet origin ${process.env.GITHUB_BASE_REF ?? ""} 2>/dev/null || true`);
  files = execSync(`git diff --name-only ${base}...HEAD`, { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
} catch {
  console.log("governance: tidak bisa menghitung diff (commit pertama?) — lolos.");
  process.exit(0);
}

const codeTouched = files.some((f) =>
  /^(app|components|content|lib|scripts|tests|\.githooks)\//.test(f) ||
  /^(Dockerfile|\.dockerignore|docker-compose\.yml|next\.config\.ts|proxy\.ts|instrumentation\.ts|vitest\.config\.m?ts|package\.json|package-lock\.json|\.npmrc)$/.test(f) ||
  /^\.github\/workflows\//.test(f)
);

if (!codeTouched) {
  console.log("governance: tidak ada perubahan kode — lolos.");
  process.exit(0);
}

const missing = [];
if (!files.includes("CHANGELOG.md")) missing.push("CHANGELOG.md");
if (!files.includes("docs/checklist.md")) missing.push("docs/checklist.md");

if (missing.length) {
  console.error(
    `governance GAGAL: perubahan kode terdeteksi tetapi ${missing.join(" dan ")} tidak diperbarui.\n` +
    `Aturan proyek: setiap perubahan kode wajib mencatat di CHANGELOG [Unreleased] dan memperbarui status docs/checklist.md.`
  );
  process.exit(1);
}
console.log("governance: OK — CHANGELOG dan checklist ikut diperbarui.");
