import type { ReactNode } from "react";
import { waLink } from "@/content/site";
import { kelas, panahTombol, tombolPrimer, tombolSekunder } from "./styles";

/**
 * Tombol yang membuka WhatsApp. Nomor WA TIDAK pernah ditulis di komponen —
 * hanya `waLink(pesan)` dari content/site.ts (lihat CLAUDE.md > Aturan kerja no.2).
 * `pesan` = teks prefill dari content/copy/*.
 *
 * Tautan eksternal: wajib rel="noopener noreferrer" (rule react/jsx-no-target-blank
 * dinaikkan ke error di eslint.config.mjs).
 */
export function WaButton({
  pesan,
  children,
  varian = "primer",
  ariaLabel,
  className,
  onClick,
  panah = false,
}: {
  pesan: string;
  children: ReactNode;
  varian?: "primer" | "sekunder";
  ariaLabel?: string;
  className?: string;
  /** Opsional, hanya dipakai dari client component (mis. menutup menu mobile). */
  onClick?: () => void;
  /** Tampilkan panah dekoratif yang bergeser saat hover (CTA utama). */
  panah?: boolean;
}) {
  return (
    <a
      href={waLink(pesan)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={onClick}
      className={kelas(varian === "primer" ? tombolPrimer : tombolSekunder, className)}
    >
      {children}
      {panah ? (
        <span aria-hidden="true" className={panahTombol}>
          &rarr;
        </span>
      ) : null}
    </a>
  );
}
