"use client";

import { useEffect } from "react";
import { onIdle } from "@/lib/idle";

const SELECTOR = "iconsax-icon[data-name]:not([name])";

function activate(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    el.setAttribute("name", el.dataset.name ?? "");
  });
}

/**
 * Port web-starter `src/components/iconsax-loader.tsx`.
 * Mendaftarkan web component resmi <iconsax-icon> HANYA di browser, saat idle (di luar jendela
 * TBT), lalu subset ikon gratis (lib/generated/iconsax-icons.json, hasil
 * scripts/iconsax-subset.mjs) via API publik paket `registerProIcons()`, lalu mengaktifkan ikon
 * (menyalin `data-name` → `name`). MutationObserver mengaktifkan ikon yang muncul kemudian
 * (navigasi client, menu mobile, form terkirim).
 *
 * - Import statis `import "iconsax"` tidak bisa: modul paket mengevaluasi
 *   `class … extends HTMLElement` di top-level → SSR gagal (ReferenceError, terbukti).
 * - Loader data gratis bawaan paket rusak di Turbopack (selalu memuat ai.json) → dipakai subset.
 */
export function IconsaxLoader() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | undefined;
    const cancelIdle = onIdle(() => {
      void Promise.all([import("iconsax"), import("@/lib/generated/iconsax-icons.json")]).then(([mod, icons]) => {
        if (cancelled) return;
        mod.registerProIcons(icons.default as Record<string, Record<string, string>>);
        activate(document);
        observer = new MutationObserver(() => activate(document));
        observer.observe(document.body, { childList: true, subtree: true });
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
      observer?.disconnect();
    };
  }, []);
  return null;
}
