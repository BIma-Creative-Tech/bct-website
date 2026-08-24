import { fokusRing, kelas } from "@/components/styles";
import type { Faq } from "@/content/copy";

/**
 * FAQ dengan <details>/<summary> native: tanpa client component, tanpa JavaScript,
 * dan tetap bisa dibuka bila JS mati. Rotasi ikon dibungkus `motion-safe:`
 * agar `prefers-reduced-motion` dihormati.
 */
export function DaftarFaq({ item }: { item: Faq[] }) {
  return (
    <ul className="mt-10 max-w-[70ch] border-t border-line">
      {item.map((faq) => (
        <li key={faq.tanya} className="border-b border-line">
          <details className="group">
            <summary
              className={kelas(
                "flex list-none items-start justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden",
                fokusRing,
              )}
            >
              <h3 className="font-display text-lg font-bold text-ink">{faq.tanya}</h3>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-xl leading-none text-accent motion-safe:transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-[65ch] pb-6 text-sm text-ink-2">{faq.jawab}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
