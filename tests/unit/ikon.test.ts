import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ICON_NAMES, ICON_STYLES } from "@/components/icon-names";

// Pola web-starter tests/unit/theme-icons.test.ts (bagian ikon).
describe("ICON_NAMES / subset iconsax", () => {
  it("semua ikon ada di set GRATIS iconsax (manifest paket)", () => {
    const manifest = JSON.parse(readFileSync("node_modules/iconsax/dist/manifest.json", "utf8")) as Record<string, unknown>;
    const missing = ICON_NAMES.filter((n) => !(n in manifest));
    expect(missing).toEqual([]);
  });

  it("tidak ada nama ganda", () => {
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });

  it("lib/generated/iconsax-icons.json sinkron dengan ICON_NAMES × ICON_STYLES (jalankan `npm run icons`)", () => {
    const subset = JSON.parse(readFileSync("lib/generated/iconsax-icons.json", "utf8")) as Record<string, Record<string, string>>;
    expect(Object.keys(subset).sort()).toEqual([...ICON_NAMES].sort());
    for (const name of ICON_NAMES) {
      expect(Object.keys(subset[name] ?? {}).sort()).toEqual([...ICON_STYLES].sort());
      for (const style of ICON_STYLES) expect(subset[name]?.[style]).toMatch(/^<svg[\s>]/);
    }
  });
});
