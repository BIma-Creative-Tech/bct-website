/**
 * Guard PII (G-22, dibangun ulang 2026-09-26 — versi di branch `ci/guards`/PR #1 tidak
 * tersedia lagi di repo bctech-adm/bct-website).
 *
 * ADR 2026-08-24: email pribadi owner tidak pernah terbit ke klien. Skrip ini memfailkan
 * build bila `site.email` atau `site.location` (bila diisi) muncul di artefak yang
 * dikirim ke browser:
 *   - `.next/static/**` (bundel JS/CSS klien), dan
 *   - prerender `.next/server/app/**` berekstensi .html/.rsc/.body/.meta/.segment.rsc
 *     (menutup batasan (a) versi lama yang hanya memindai .next/static).
 * Nilainya dibaca dari `content/site.ts` saat skrip berjalan (TIDAK ditulis literal di
 * repo), dan TIDAK PERNAH dicetak ke log — hanya nama field + path berkas.
 * Fail-closed: berkas hilang, nilai email tak terbaca, atau nol berkas terpindai → exit 1.
 * Jalankan setelah `npm run build`:  node scripts/check-pii.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

function gagal(pesan) {
  console.error(`check-pii GAGAL: ${pesan}`);
  process.exit(1);
}

let sumber;
try {
  sumber = readFileSync("content/site.ts", "utf8");
} catch {
  gagal("content/site.ts tidak terbaca");
}
const blokSite = sumber.match(/export const site = \{([\s\S]*?)\n\} as const;/)?.[1];
if (!blokSite) gagal("objek `site` di content/site.ts tidak ditemukan");

function nilai(field) {
  return blokSite.match(new RegExp(`^\\s*${field}:\\s*"([^"]*)"`, "m"))?.[1];
}

const email = nilai("email");
if (!email || !email.includes("@")) gagal("site.email tidak terbaca (guard tidak boleh lolos diam-diam)");
const dicari = [["site.email", email]];
const lokasi = nilai("location");
if (lokasi === undefined) gagal("site.location tidak terbaca");
if (lokasi.trim().length >= 3) dicari.push(["site.location", lokasi]);

function* telusuri(dir) {
  for (const nama of readdirSync(dir)) {
    const p = join(dir, nama);
    if (statSync(p).isDirectory()) yield* telusuri(p);
    else yield p;
  }
}

const target = [];
if (!existsSync(".next/static")) gagal(".next/static tidak ada — jalankan `npm run build` dulu");
for (const p of telusuri(".next/static")) target.push(p);
if (existsSync(".next/server/app")) {
  for (const p of telusuri(".next/server/app")) {
    if (/\.(html|rsc|body|meta)$/.test(p)) target.push(p);
  }
}
const jumlahStatic = target.filter((p) => p.startsWith(".next/static")).length;
if (jumlahStatic === 0) gagal("nol berkas di .next/static — pemindaian rusak");

const temuan = [];
for (const p of target) {
  const isi = readFileSync(p).toString("latin1");
  for (const [nama, v] of dicari) {
    if (isi.includes(v)) temuan.push(`${nama} di ${p}`);
  }
}

if (temuan.length) gagal(`data pribadi terbit ke artefak klien:\n- ${temuan.join("\n- ")}`);
console.log(
  `check-pii: OK — ${target.length} berkas dipindai (${jumlahStatic} di .next/static), ` +
    `${dicari.map(([n]) => n).join(" + ")} tidak ditemukan.`,
);
