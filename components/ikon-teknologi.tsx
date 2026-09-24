import type { CSSProperties, ReactNode } from "react";
import { kelas } from "./styles";

/**
 * Ikon bidang kerja BCT (code, desain, database, cloud, mobile, data) yang
 * "melayang" di atas foto hero beranda.
 *
 * Murni dekoratif: seluruh pembungkusnya `aria-hidden`, tanpa teks, jadi tidak
 * ada copy yang perlu tinggal di content/. SVG-nya digambar di sini (garis 24×24,
 * stroke currentColor) supaya tidak menambah dependensi ikon.
 *
 * Warna dari token (`text-accent`, `text-ink-2`, `bg-surface`, `border-line`) —
 * dipasang di dalam blok `.tema-gelap`, jadi nilainya palet gelap di light maupun
 * dark mode. Gerak melayang hanya jalan dengan `motion-safe:` (mati untuk
 * prefers-reduced-motion).
 */

const garis = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const IKON = {
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  desain: (
    <>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </>
  ),
  cloud: <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 0 0 4.5 12a3.5 3.5 0 0 0 .5 7z" />,
  mobile: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </>
  ),
  data: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </>
  ),
  terminal: (
    <>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </>
  ),
  bentuk: (
    <>
      <circle cx="7" cy="7" r="4" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
      <path d="M17 3l4 7h-8z" />
    </>
  ),
  kilau: (
    <>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type NamaIkon = keyof typeof IKON;

/** Satu ikon garis 24×24, dekoratif (`aria-hidden`). Ukuran lewat `className`. */
export function IkonBidang({ nama, className = "h-6 w-6" }: { nama: NamaIkon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...garis}>
      {IKON[nama]}
    </svg>
  );
}

function Chip({
  nama,
  besar,
  aksen,
  className,
  style,
}: {
  nama: NamaIkon;
  besar?: boolean;
  aksen?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={kelas(
        "flex items-center justify-center rounded-2xl border border-line bg-surface/70 backdrop-blur-sm",
        besar ? "h-16 w-16" : "h-11 w-11",
        aksen ? "text-accent" : "text-ink-2",
        className,
      )}
      style={style}
    >
      <IkonBidang nama={nama} className={besar ? "h-7 w-7" : "h-5 w-5"} />
    </span>
  );
}

/**
 * Posisi chip di sisi kanan hero (xl+), persen dari kotak hero. Semua `kiri` ≥ 70%:
 * pada 1280 px teks hero berakhir di ±64% lebar, jadi chip tidak pernah menimpa teks.
 * Di bawah xl (teks makin lebar relatif terhadap layar) chip diganti deret statis.
 */
const SEBARAN: Array<{ nama: NamaIkon; atas: string; kiri: string; besar?: boolean; aksen?: boolean; tunda: string }> = [
  { nama: "code", atas: "12%", kiri: "70%", besar: true, aksen: true, tunda: "0s" },
  { nama: "cloud", atas: "8%", kiri: "88%", tunda: "3.1s" },
  { nama: "desain", atas: "28%", kiri: "85%", besar: true, tunda: "1.2s" },
  { nama: "terminal", atas: "38%", kiri: "73%", tunda: "4s" },
  { nama: "database", atas: "50%", kiri: "90%", tunda: "2.4s" },
  { nama: "bentuk", atas: "58%", kiri: "78%", aksen: true, tunda: "2.9s" },
  { nama: "mobile", atas: "70%", kiri: "92%", aksen: true, tunda: "0.6s" },
  { nama: "data", atas: "74%", kiri: "71%", besar: true, tunda: "1.8s" },
];

/** xl+: chip tersebar melayang di sisi kanan foto. */
export function IkonTeknologiMelayang() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
      {SEBARAN.map((item) => (
        <Chip
          key={item.nama}
          nama={item.nama}
          besar={item.besar}
          aksen={item.aksen}
          className="absolute motion-safe:animate-melayang"
          style={{ top: item.atas, left: item.kiri, animationDelay: item.tunda }}
        />
      ))}
    </div>
  );
}

/** < xl: deret chip kecil di atas eyebrow, jadi tidak pernah menimpa teks. */
export function IkonTeknologiDeret() {
  const deret: NamaIkon[] = ["code", "desain", "database", "cloud", "mobile", "data"];
  return (
    <div aria-hidden="true" className="mb-8 flex flex-wrap gap-2 xl:hidden">
      {deret.map((nama, i) => (
        <Chip key={nama} nama={nama} aksen={i % 3 === 0} />
      ))}
    </div>
  );
}
