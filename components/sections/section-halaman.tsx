import type { ReactNode } from "react";
import { kelas, wadah } from "@/components/styles";

/**
 * Pembungkus <section> standar halaman dalam.
 *
 * `idJudul` WAJIB menunjuk id heading di dalamnya (biasanya <h2> dari
 * <KepalaSection>), supaya setiap landmark section punya nama aksesibel.
 * `latar="surface"` dipakai untuk memberi jeda visual antar blok panjang —
 * polanya sama dengan section "cara kerja" di beranda.
 */
export function SectionHalaman({
  idJudul,
  latar = "bg",
  className,
  children,
}: {
  idJudul: string;
  latar?: "bg" | "surface";
  className?: string;
  children: ReactNode;
}) {
  if (latar === "surface") {
    return (
      <section aria-labelledby={idJudul} className="border-y border-line bg-surface">
        <div className={kelas(wadah, "py-16 sm:py-20", className)}>{children}</div>
      </section>
    );
  }

  return (
    <section aria-labelledby={idJudul} className={kelas(wadah, "py-16 sm:py-20", className)}>
      {children}
    </section>
  );
}
