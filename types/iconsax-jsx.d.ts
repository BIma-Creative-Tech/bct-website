import type { DetailedHTMLProps, HTMLAttributes } from "react";

/** Tipe JSX untuk web component resmi Iconsax `<iconsax-icon>` (React 19 custom elements). */
type IconsaxIconAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  /** Opsional: di template diisi dari `data-name` oleh IconsaxLoader setelah registry siap. */
  name?: string;
  "data-name"?: string;
  type?: "linear" | "outline" | "bold" | "bulk" | "broken" | "twotone";
  size?: string | number;
  color?: string;
  /** Ambil SVG dari registry lokal registerProIcons() (di template: subset ikon GRATIS). */
  pro?: "" | boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "iconsax-icon": IconsaxIconAttributes;
    }
  }
}
