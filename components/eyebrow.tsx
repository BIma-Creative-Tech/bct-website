import type { ReactNode } from "react";
import { kelas } from "./styles";

/**
 * Eyebrow sesuai design system BCT: mono uppercase + letter-spacing,
 * dengan garis pendek accent di kiri (lihat CLAUDE.md > Design system).
 * Teksnya selalu datang dari content/copy/*.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={kelas(
        "flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-6 shrink-0 bg-accent" />
      <span>{children}</span>
    </p>
  );
}
