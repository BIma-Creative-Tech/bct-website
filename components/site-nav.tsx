"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navCta, navProduk, navUtama } from "@/content/copy";
import { saringTautan } from "@/content/rute";
import { produk, site } from "@/content/site";
import { Icon } from "./icon";
import { fokusRing, kelas, wadah } from "./styles";
import { WaButton } from "./wa-button";

/**
 * Header + navigasi utama.
 *
 * CATATAN TAUTAN (W2-12): nav hanya menautkan rute yang sudah HIDUP. Penyaringnya
 * `saringTautan()` dari content/rute.ts — daftar rute hidupnya ada di sana dan
 * HANYA di sana, dipakai bersama footer dan seluruh halaman. Menghidupkan
 * /studi-kasus (W2-03) atau /insight (W2-06) = menambah satu baris di berkas itu,
 * bukan menyunting komponen ini. Data nav-nya sendiri tetap utuh di
 * content/copy/umum.ts — jangan menghapus item dari copy.
 *
 * Label a11y di bawah bukan copy pemasaran (tidak tersedia di content/copy/umum.ts).
 * Bila content-writer menambahkannya ke content/, ganti konstanta ini dengan impor.
 */
const A11Y = {
  navUtama: "Navigasi utama",
  bukaMenu: "Buka menu navigasi",
  tutupMenu: "Tutup menu navigasi",
} as const;

const menuUtama = saringTautan(navUtama);

/** Item "Produk" di navUtama adalah pemicu dropdown navProduk, bukan tautan biasa. */
const pemicuProduk = menuUtama.find((item) => item.href.startsWith("/produk/"));
const menuLain = menuUtama.filter((item) => !item.href.startsWith("/produk/"));

/** Nama produk diambil dari content/site.ts lewat slug; subLabel dari content/copy. */
const tautanProduk = saringTautan(navProduk).flatMap((item) => {
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
    // `header-gulir` (app/globals.css): padat di puncak, blur-transparan + bayangan
    // setelah digulir — CSS scroll-driven, tanpa listener scroll.
    <header className="header-gulir sticky top-0 z-40 border-b border-line bg-bg">
      {/* Pita gradien merek di tepi atas setiap halaman (dekoratif). */}
      <div aria-hidden="true" className="h-1 bg-gradien" />
      {/* h-20 (bukan h-16) agar logo tulisan tangan tetap terbaca di 56–64 px. */}
      <div className={kelas(wadah, "flex h-20 items-center justify-between gap-4")}>
        <Link
          href="/"
          aria-label={site.name}
          className={kelas(
            "inline-flex min-h-11 items-center rounded-full pr-3 font-display text-base font-extrabold tracking-tight text-ink",
            fokusRing,
          )}
        >
          {/* Logo resmi BCT (tulisan tangan dalam lingkaran). alt kosong karena nama
              aksesibel tautan sudah datang dari aria-label={site.name} di atas.
              Sumber 1720×1598 diperkecil ke public/brand/logo-bct.png (207×192,
              cukup untuk tampilan 64 px di layar 3×). */}
          <Image
            src="/brand/logo-bct.png"
            alt=""
            width={207}
            height={192}
            loading="eager"
            className="h-14 w-auto md:h-16"
          />
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
                <Icon
                  name="arrow-down-02"
                  size={14}
                  className={kelas(produkTerbuka && "rotate-180", "motion-safe:transition-transform")}
                />
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
          {/* `key` memasang ulang elemen saat ikon berganti: IconsaxLoader hanya
              mengaktifkan <iconsax-icon> BARU (atribut `name` tidak dikelola React). */}
          <Icon key={menuTerbuka ? "tutup" : "buka"} name={menuTerbuka ? "close-circle" : "textalign-justifycenter"} size={22} />
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
