import { fokusRing, kelas } from "./styles";

/**
 * Skip link: elemen pertama di DOM, tersembunyi sampai difokus keyboard.
 * Menuju <main id="konten-utama"> di app/layout.tsx.
 *
 * CATATAN COPY: string "Lewati ke konten" berasal dari brief W1-02 dan belum ada
 * di content/copy/umum.ts. Bila content-writer menambahkannya, ganti konstanta ini
 * dengan impor supaya seluruh teks tetap satu sumber.
 */
const LABEL_LEWATI = "Lewati ke konten";

export function SkipLink() {
  return (
    <a
      href="#konten-utama"
      className={kelas(
        "sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50",
        "focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full",
        "focus:border focus:border-accent focus:bg-surface focus:px-5 focus:text-sm focus:font-semibold focus:text-ink",
        fokusRing,
      )}
    >
      {LABEL_LEWATI}
    </a>
  );
}
