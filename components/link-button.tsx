import Link from "next/link";
import type { ReactNode } from "react";
import { kelas, panahTombol, tombolPrimer, tombolSekunder } from "./styles";

/** Tombol untuk tautan internal (Next.js Link). Label & href dari content/copy/*. */
export function LinkButton({
  href,
  children,
  varian = "sekunder",
  className,
  panah = false,
}: {
  href: string;
  children: ReactNode;
  varian?: "primer" | "sekunder";
  className?: string;
  /** Tampilkan panah dekoratif yang bergeser saat hover. */
  panah?: boolean;
}) {
  return (
    <Link
      href={href}
      className={kelas(varian === "primer" ? tombolPrimer : tombolSekunder, className)}
    >
      {children}
      {panah ? (
        <span aria-hidden="true" className={panahTombol}>
          &rarr;
        </span>
      ) : null}
    </Link>
  );
}
