#!/usr/bin/env node
/**
 * Ekstrak SUBSET ikon GRATIS Iconsax yang dipakai template dari data paket `iconsax`
 * (node_modules/iconsax/dist/{manifest.json,data/*.json}, MIT) → lib/generated/iconsax-icons.json.
 *
 * Kenapa: loader bawaan paket memakai `new URL(`./data/${category}.json`, import.meta.url)`;
 * Turbopack (Next 16.3.6) mengompilasinya menjadi referensi STATIS ke file pertama (ai.json)
 * untuk semua kategori → ikon di luar kategori "ai" tidak pernah tampil (terbukti di build
 * produksi, lihat docs/design.md §Ikon). Subset ini didaftarkan via API publik paket
 * `registerProIcons()` (registry ikon yang sudah di-resolve lokal) → tanpa fetch runtime.
 *
 * Sumber daftar: ICON_NAMES & ICON_STYLES di components/icon-names.ts.
 * Dijalankan otomatis oleh `npm run build`; manual: `npm run icons`.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "components/icon-names.ts"), "utf8");

function listConst(name) {
  const m = src.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`));
  if (!m) throw new Error(`${name} tidak ditemukan di icon-names.ts`);
  return [...m[1].matchAll(/"([a-z0-9-]+)"/g)].map((x) => x[1]);
}

const names = listConst("ICON_NAMES");
const styles = listConst("ICON_STYLES");
const pkg = join(root, "node_modules/iconsax/dist");
const manifest = JSON.parse(readFileSync(join(pkg, "manifest.json"), "utf8"));
const cache = new Map();
const out = {};

for (const name of names) {
  const entry = manifest[name];
  if (!entry) throw new Error(`Ikon "${name}" tidak ada di set gratis iconsax`);
  if (!cache.has(entry.category)) {
    cache.set(entry.category, JSON.parse(readFileSync(join(pkg, "data", `${entry.category}.json`), "utf8")));
  }
  const data = cache.get(entry.category)[name];
  out[name] = {};
  for (const style of styles) {
    if (!data?.[style]) throw new Error(`Ikon "${name}" tidak punya gaya "${style}"`);
    out[name][style] = data[style];
  }
}

const file = join(root, "lib/generated/iconsax-icons.json");
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, JSON.stringify(out) + "\n");
console.log(`iconsax subset: ${names.length} ikon × ${styles.length} gaya → ${file.replace(root + "/", "")} (${JSON.stringify(out).length} B)`);
