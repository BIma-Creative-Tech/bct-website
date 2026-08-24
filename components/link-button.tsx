import Link from "next/link";
import type { ReactNode } from "react";
import { kelas, tombolPrimer, tombolSekunder } from "./styles";

/** Tombol untuk tautan internal (Next.js Link). Label & href dari content/copy/*. */
export function LinkButton({
  href,
  children,
  varian = "sekunder",
  className,
}: {
  href: string;
  children: ReactNode;
  varian?: "primer" | "sekunder";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={kelas(varian === "primer" ? tombolPrimer : tombolSekunder, className)}
    >
      {children}
    </Link>
  );
}
