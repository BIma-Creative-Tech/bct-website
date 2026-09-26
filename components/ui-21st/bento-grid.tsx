/**
 * Bento Grid — 21st.dev: https://21st.dev/@dillionverma/components/bento-grid (license: MIT)
 * Author: Dillion Verma / Magic UI. Upstream source: magicuidesign/magicui
 * @ d7207e5692d14c00dceafa8488d6d01f197fa0e4 apps/www/registry/magicui/bento-grid.tsx (MIT).
 * Diadaptasi dari web-starter `src/components/ui-21st/bento-grid.tsx` (2026-09-26, G-39).
 * Detail provenance & perubahan: COMPONENTS.md.
 *
 * Adaptasi: warna neutral-* → token BCT (`bg-surface`, `border-line`, `text-ink`, `text-ink-2`,
 * aksen hanya chip ikon + hover — satu aksen merah); `@radix-ui/react-icons` diganti <Icon>
 * Iconsax (via `ikon` ReactNode); SELURUH kartu satu tautan (`href`, target sentuh besar,
 * fokus terlihat) menggantikan CTA yang hanya muncul saat hover — tidak perlu label CTA baru
 * di copy; slot `children` untuk baris bawah kartu (mis. paket masuk + harga dari
 * content/site.ts); gerak hover = `kartuInteraktif` (translate/shadow, `motion-safe:`);
 * grid responsif 1 → 2 → 3 kolom; `cn` → `kelas`.
 */
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { fokusRing, kartuInteraktif, kelas } from "@/components/styles";

interface BentoGridProps extends ComponentPropsWithoutRef<"ul"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  nama: string;
  deskripsi: string;
  href: string;
  /** Chip ikon (dekoratif) — biasanya <IkonBidang>/<Icon>. */
  ikon: ReactNode;
  /** Lapisan latar dekoratif (aria-hidden), mis. gradien token. */
  latar?: ReactNode;
  /** Kelas pada <li> (span grid + atribut reveal lewat `liProps`). */
  className?: string;
  liProps?: ComponentPropsWithoutRef<"li">;
  children?: ReactNode;
  /** Ikon panah di samping nama (dekoratif). */
  panah?: ReactNode;
}

export const BentoGrid = ({ children, className, ...props }: BentoGridProps) => (
  <ul className={kelas("grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)} {...props}>
    {children}
  </ul>
);

export const BentoCard = ({ nama, deskripsi, href, ikon, latar, className, liProps, children, panah }: BentoCardProps) => (
  <li {...liProps} className={kelas("flex", className)}>
    <Link
      href={href}
      className={kelas(
        "group relative isolate flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-7",
        kartuInteraktif,
        fokusRing,
      )}
    >
      {latar ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {latar}
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <span className="inline-flex self-start rounded-xl bg-accent-soft p-3 text-accent group-hover:bg-accent group-hover:text-bg motion-safe:transition motion-safe:duration-300 motion-safe:group-hover:scale-110">
          {ikon}
        </span>
        <h3 className="mt-2 flex items-start justify-between gap-3 font-display text-xl font-bold text-ink group-hover:text-accent motion-safe:transition-colors">
          {nama}
          {panah}
        </h3>
        <p className="max-w-[48ch] text-sm text-ink-2">{deskripsi}</p>
      </div>
      {children}
    </Link>
  </li>
);
