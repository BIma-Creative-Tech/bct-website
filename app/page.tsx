import Link from "next/link";
import { site, produk, bukti, waLink } from "@/content/site";

/**
 * Beranda — scaffold W1. Struktur final, copy awal nyata (bukan lorem).
 * Lanjutkan sesuai backlog di CLAUDE.md: nav, footer, section bukti, CTA.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="py-24">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Bima Creative Tech · Depok, Indonesia
        </p>
        <h1 className="mt-5 max-w-3xl text-5xl font-extrabold">
          Sistem yang membuat bisnis Anda tahu, bukan menebak.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-2">{site.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={waLink("Halo BCT, saya ingin konsultasi kebutuhan sistem bisnis saya.")}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-bg"
          >
            Konsultasi via WhatsApp
          </a>
          <Link
            href="/pricing"
            className="rounded-full border border-line px-6 py-3 font-semibold"
          >
            Lihat Pricing
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
        {produk.map((p) => (
          <Link
            key={p.slug}
            href={`/produk/${p.slug}`}
            className="rounded-xl border border-line bg-surface p-6 hover:border-accent"
          >
            <h2 className="text-xl font-bold">{p.nama}</h2>
            <p className="mt-2 text-sm text-ink-2">{p.ringkas}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 border-t border-line py-16 sm:grid-cols-3">
        {bukti.map((b) => (
          <div key={b.label}>
            <div className="font-display text-2xl font-extrabold">{b.angka}</div>
            <div className="text-sm text-ink-2">{b.label}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
