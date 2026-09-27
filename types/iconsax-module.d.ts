// Paket `iconsax@0.1.1` mendeklarasikan "types": "dist/index.d.ts" tetapi file itu TIDAK ada
// di tarball (diverifikasi 2026-09-25). Deklarasi minimal sesuai dist/index.js.
declare module "iconsax" {
  export class IconsaxIcon extends HTMLElement {}
  export function registerProIcons(data: Record<string, Record<string, string>>): void;
}
