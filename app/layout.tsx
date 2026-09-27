import type { Metadata } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import { Bricolage_Grotesque, Figtree, IBM_Plex_Mono } from "next/font/google";
import { IconsaxLoader } from "@/components/iconsax-loader";
import { ScrollEnhancer } from "@/components/scroll-enhancer";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { SkipLink } from "@/components/skip-link";
import { WaFloatingButton } from "@/components/wa-floating-button";
import { site } from "@/content/site";
import { getEnv } from "@/lib/env";
import { isIndexable } from "@/lib/site";
import { propsSkripUmami } from "@/lib/umami";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["500", "700", "800"],
});
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

/**
 * `metadataBase` (dasar canonical, og:url, dan URL kartu OG) dibaca dari env `SITE_URL` SAAT
 * REQUEST, bukan dari konstanta build — satu image untuk staging dan production (ADR
 * 2026-09-26, pola web-starter). Host staging/localhost → `noindex, nofollow`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { SITE_URL } = getEnv();
  return {
    title: {
      default: `Sistem bisnis modern untuk UKM Indonesia — ${site.name}`,
      template: `%s — ${site.name}`,
    },
    description: site.tagline,
    metadataBase: new URL(SITE_URL),
    robots: isIndexable(SITE_URL) ? { index: true, follow: true } : { index: false, follow: false },
  };
}

/**
 * Tracker Umami self-host (W3-02, G-47) — hanya bila UMAMI_SCRIPT_URL + UMAMI_WEBSITE_ID terisi
 * (dibaca saat request). Tag <script defer> biasa yang dirender SERVER component ini dengan nonce
 * request dari proxy.ts (header `x-nonce`), bukan `next/script` (komponen client: nonce harus
 * dioper sebagai prop client). Catatan jujur: seperti semua elemen server component, atribut tag
 * ini ikut terserialisasi di payload RSC inline — nonce yang sama SUDAH ada di sana belasan kali
 * lewat hint preload Next sendiri (diukur di v0.1.0), jadi tidak ada paparan baru.
 * Atribut & alasannya: lib/umami.ts.
 */
async function SkripUmami() {
  const env = getEnv();
  const props = propsSkripUmami(env, env.SITE_URL, (await headers()).get("x-nonce"));
  return props ? <script {...props} /> : null;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Render dinamis per request agar nonce CSP (proxy.ts) bisa diterapkan Next ke skripnya
  // (docs guides/content-security-policy.md §Forcing dynamic rendering).
  await connection();
  return (
    <html lang="id" className={`${bricolage.variable} ${figtree.variable} ${plexMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SiteNav />
        {/* tabIndex={-1} agar skip link benar-benar memindahkan fokus, bukan
            hanya menggulirkan halaman. */}
        <main id="konten-utama" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <WaFloatingButton />
        {/* Pulau client kecil: mendaftarkan <iconsax-icon> + subset ikon saat idle (G-37). */}
        <IconsaxLoader />
        {/* Pulau client kecil: reveal saat digulir + Number Ticker, mulai saat idle (G-38). */}
        <ScrollEnhancer />
        <SkripUmami />
      </body>
    </html>
  );
}
