/**
 * Daftar ikon Iconsax (GRATIS) yang dipakai situs. Menambah ikon: tambahkan namanya di sini
 * (cari di https://iconsax.io, hanya ikon free), lalu `npm run icons` (juga otomatis saat build)
 * → lib/generated/iconsax-icons.json (di-commit). Hanya ikon di daftar ini yang di-bundle.
 * Divalidasi oleh tests/unit/ikon.test.ts. Pola: web-starter `src/components/icon-names.ts`.
 */
export const ICON_NAMES = [
  // Bidang kerja (hero beranda, chip kartu produk)
  "code",
  "pen-tool",
  "data",
  "cloud",
  "mobile",
  "chart",
  "command",
  "shapes",
  "magic-star",
  "presention-chart",
  // Daftar bertanda
  "tick-circle",
  "minus",
  // Navigasi & tombol
  "arrow-right-01",
  "arrow-down-02",
  "textalign-justifycenter",
  "close-circle",
  "messages-2",
  "pause",
  "play",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** Gaya ikon yang di-bundle (tiap gaya menambah ukuran subset). */
export const ICON_STYLES = ["linear", "bulk"] as const;

export type IconStyle = (typeof ICON_STYLES)[number];
