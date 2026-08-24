import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { SkipLink } from "@/components/skip-link";
import { WaFloatingButton } from "@/components/wa-floating-button";
import { site } from "@/content/site";
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

export const metadata: Metadata = {
  title: {
    default: `Sistem bisnis modern untuk UKM Indonesia — ${site.name}`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  metadataBase: new URL(site.domain),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
      </body>
    </html>
  );
}
