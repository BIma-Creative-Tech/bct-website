"use client";

import { useEffect, useRef } from "react";

/**
 * Cahaya lembut beraksen yang mengikuti kursor di dalam elemen induknya
 * (diadaptasi dari hero referensi v0, G-29).
 *
 * Dibuat hemat, berbeda dari referensinya yang memakai useState per mousemove:
 * - Tidak ada state React — posisi ditulis sebagai variabel CSS (--kx/--ky) lewat
 *   requestAnimationFrame, jadi nol re-render.
 * - Hanya aktif untuk pointer presisi (mouse/trackpad) dan bila pengunjung TIDAK
 *   meminta prefers-reduced-motion. Di HP/tablet komponen ini diam dan tak terlihat.
 * - Mendengarkan pointer di elemen INDUK saja (bukan window), jadi berhenti bekerja
 *   begitu kursor keluar dari hero.
 *
 * Induknya wajib `relative` (atau positioned) dan sebaiknya `overflow-hidden`.
 * Warna dari token `--accent` — ikut tema/`.tema-gelap` otomatis.
 */
export function CahayaKursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const induk = el?.parentElement;
    if (!el || !induk) return;

    const presisi = window.matchMedia("(pointer: fine)").matches;
    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!presisi || kurangiGerak) return;

    let bingkai = 0;
    let x = 0;
    let y = 0;

    function tulis() {
      bingkai = 0;
      el!.style.setProperty("--kx", `${x}px`);
      el!.style.setProperty("--ky", `${y}px`);
    }

    function saatGerak(event: PointerEvent) {
      const kotak = induk!.getBoundingClientRect();
      x = event.clientX - kotak.left;
      y = event.clientY - kotak.top;
      el!.style.opacity = "1";
      if (!bingkai) bingkai = requestAnimationFrame(tulis);
    }

    function saatKeluar() {
      el!.style.opacity = "0";
    }

    induk.addEventListener("pointermove", saatGerak);
    induk.addEventListener("pointerleave", saatKeluar);
    return () => {
      induk.removeEventListener("pointermove", saatGerak);
      induk.removeEventListener("pointerleave", saatKeluar);
      if (bingkai) cancelAnimationFrame(bingkai);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(360px circle at var(--kx, 50%) var(--ky, 50%), color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
      }}
    />
  );
}
