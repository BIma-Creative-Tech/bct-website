import Link from "next/link";
import type { ReactNode } from "react";
import { kelas, panahTombol, tombolPrimer, tombolSekunder } from "./styles";
import { Icon } from "./icon";

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
        <Icon name="arrow-right-01" size={16} className={panahTombol} />
      ) : null}
    </Link>
  );
}
