"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navCta, navProduk, navUtama } from "@/content/copy";
import { produk, site } from "@/content/site";
import { fokusRing, kelas, wadah } from "./styles";
import { WaButton } from "./wa-button";

/**
 * Header + navigasi utama.
 *
 * CATATAN TAUTAN: /pricing, /studi-kasus, /tentang, /kontak, dan /produk/* baru
 * dibuat pada sprint W2 (lihat sitemap di CLAUDE.md). Tautannya sengaja sudah
 * dipasang sesuai sitemap dan akan 404 sampai halaman tujuan ada — situs belum
 * di-deploy selama W1.
 *
 * Label a11y di bawah bukan copy pemasaran (tidak tersedia di content/copy/umum.ts).
 * Bila content-writer menambahkannya ke content/, ganti konstanta ini dengan impor.
 */
const A11Y = {
  navUtama: "Navigasi utama",
  bukaMenu: "Buka menu navigasi",
  tutupMenu: "Tutup menu navigasi",
} as const;

/**
 * "Insight" (/insight) DISEMBUNYIKAN sampai W2-06 karena halamannya belum ada.
 * Datanya tetap utuh di content/copy/umum.ts — cukup kosongkan array ini saat
 * W2-06 selesai, jangan menghapus item dari copy.
 */
const HREF_DITUNDA: string[] = ["/insight"];

const menuUtama = navUtama.filter((item) => !HREF_DITUNDA.includes(item.href));

/** Item "Produk" di navUtama adalah pemicu dropdown navProduk, bukan tautan biasa. */
const pemicuProduk = menuUtama.find((item) => item.href.startsWith("/produk/"));
const menuLain = menuUtama.filter((item) => !item.href.startsWith("/produk/"));

/** Nama produk diambil dari content/site.ts lewat slug; subLabel dari content/copy. */
const tautanProduk = navProduk.flatMap((item) => {
  const data = produk.find((p) => p.slug === item.slug);
  return data
    ? [{ slug: item.slug, href: item.href, nama: data.nama, subLabel: item.subLabel }]
    : [];
});

const ID_MENU_MOBILE = "menu-navigasi-mobile";
const ID_MENU_PRODUK = "menu-navigasi-produk";

const kelasTautanMenu = kelas(
  "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-ink-2",
  "hover:text-ink motion-safe:transition-colors",
  fokusRing,
);

export function SiteNav() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [produkTerbuka, setProdukTerbuka] = useState(false);
  const pathname = usePathname();
  const tombolMenuRef = useRef<HTMLButtonElement>(null);
  const tombolProdukRef = useRef<HTMLButtonElement>(null);
  const panelProdukRef = useRef<HTMLDivElement>(null);

  // Menu ditutup dari event handler tautan (bukan dari useEffect [pathname]):
  // memanggil setState di dalam effect memicu cascading render dan ditolak
  // rule react-hooks/set-state-in-effect.
  function tutupSemua() {
    setMenuTerbuka(false);
    setProdukTerbuka(false);
  }

  // Escape menutup menu dan mengembalikan fokus ke tombol pemicunya.
  useEffect(() => {
    if (!menuTerbuka && !produkTerbuka) return;
    function saatKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (produkTerbuka) {
        setProdukTerbuka(false);
        tombolProdukRef.current?.focus();
        return;
      }
      setMenuTerbuka(false);
      tombolMenuRef.current?.focus();
    }
    document.addEventListener("keydown", saatKeyDown);
    return () => document.removeEventListener("keydown", saatKeyDown);
  }, [menuTerbuka, produkTerbuka]);

  // Klik di luar menutup dropdown produk (desktop).
  useEffect(() => {
    if (!produkTerbuka) return;
    function saatPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        panelProdukRef.current?.contains(target) ||
        tombolProdukRef.current?.contains(target)
      ) {
        return;
      }
      setProdukTerbuka(false);
    }
    document.addEventListener("pointerdown", saatPointerDown);
    return () => document.removeEventListener("pointerdown", saatPointerDown);
  }, [produkTerbuka]);

  const halamanIni = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className={kelas(wadah, "flex h-16 items-center justify-between gap-4")}>
        <Link
          href="/"
          aria-label={site.name}
          className={kelas(
            "inline-flex min-h-11 items-center rounded-full pr-3 font-display text-base font-extrabold tracking-tight text-ink",
            fokusRing,
          )}
        >
          <span aria-hidden="true" className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
          <span aria-hidden="true" className="md:hidden">
            {site.shortName}
          </span>
          <span aria-hidden="true" className="hidden md:inline">
            {site.name}
          </span>
        </Link>

        {/* Desktop: navigasi horizontal mulai breakpoint md */}
        <nav aria-label={A11Y.navUtama} className="hidden md:flex md:items-center md:gap-1">
          {pemicuProduk ? (
            <div className="relative">
              <button
                ref={tombolProdukRef}
                type="button"
                aria-expanded={produkTerbuka}
                aria-controls={ID_MENU_PRODUK}
                onClick={() => setProdukTerbuka((sebelumnya) => !sebelumnya)}
                className={kelas(kelasTautanMenu, "gap-1", produkTerbuka && "text-ink")}
              >
                {pemicuProduk.label}
                <IkonChevron terbuka={produkTerbuka} />
              </button>
              <div
                ref={panelProdukRef}
                id={ID_MENU_PRODUK}
                hidden={!produkTerbuka}
                className="absolute top-full left-0 z-50 mt-2 w-80 rounded-xl border border-line bg-surface p-2"
              >
                <ul>
                  {tautanProduk.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={item.href}
                        aria-current={halamanIni(item.href)}
                        onClick={tutupSemua}
                        className={kelas(
                          "block rounded-lg px-3 py-2 hover:bg-accent-soft motion-safe:transition-colors",
                          fokusRing,
                        )}
                      >
                        <span className="block text-sm font-semibold text-ink">{item.nama}</span>
                        <span className="block text-xs text-ink-2">{item.subLabel}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {menuLain.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={halamanIni(item.href)}
              onClick={tutupSemua}
              className={kelas(kelasTautanMenu, pathname === item.href && "text-ink")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <WaButton pesan={navCta.pesan} className="px-5">
            {navCta.label}
          </WaButton>
        </div>

        {/* Mobile: tombol toggle */}
        <button
          ref={tombolMenuRef}
          type="button"
          aria-expanded={menuTerbuka}
          aria-controls={ID_MENU_MOBILE}
          onClick={() => setMenuTerbuka((sebelumnya) => !sebelumnya)}
          className={kelas(
            "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line bg-surface text-ink md:hidden",
            fokusRing,
          )}
        >
          <IkonMenu terbuka={menuTerbuka} />
          <span className="sr-only">{menuTerbuka ? A11Y.tutupMenu : A11Y.bukaMenu}</span>
        </button>
      </div>

      {/* Mobile: panel menu. Selalu ada di DOM agar aria-controls valid; ditutup
          dengan atribut `hidden` (display:none → tidak fokusable, tidak dibaca AT). */}
      <nav
        id={ID_MENU_MOBILE}
        aria-label={A11Y.navUtama}
        hidden={!menuTerbuka}
        className="border-t border-line bg-bg md:hidden"
      >
        <div className={kelas(wadah, "py-4")}>
          {pemicuProduk ? (
            <>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {pemicuProduk.label}
              </p>
              <ul className="mt-2">
                {tautanProduk.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      aria-current={halamanIni(item.href)}
                      onClick={tutupSemua}
                      className={kelas("block rounded-lg px-3 py-2.5", fokusRing)}
                    >
                      <span className="block text-sm font-semibold text-ink">{item.nama}</span>
                      <span className="block text-xs text-ink-2">{item.subLabel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <ul className="mt-3 border-t border-line pt-3">
            {menuLain.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={halamanIni(item.href)}
                  onClick={tutupSemua}
                  className={kelas(
                    "flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink",
                    fokusRing,
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <WaButton pesan={navCta.pesan} onClick={tutupSemua} className="mt-4 w-full">
            {navCta.label}
          </WaButton>
        </div>
      </nav>
    </header>
  );
}

/** Ikon dekoratif — inline SVG (tanpa aset CDN), mewarisi currentColor. */
function IkonChevron({ terbuka }: { terbuka: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={kelas("h-3 w-3", terbuka && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 6 8 10.5 12.5 6" />
    </svg>
  );
}

function IkonMenu({ terbuka }: { terbuka: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      {terbuka ? (
        <>
          <path d="M4.5 4.5 15.5 15.5" />
          <path d="M15.5 4.5 4.5 15.5" />
        </>
      ) : (
        <>
          <path d="M3 6h14" />
          <path d="M3 10h14" />
          <path d="M3 14h14" />
        </>
      )}
    </svg>
  );
}
