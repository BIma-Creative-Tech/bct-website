import type { CSSProperties } from "react";
import { Icon, type IconName } from "./icon";
import { kelas } from "./styles";

/**
 * Ikon bidang kerja BCT (code, desain, database, cloud, mobile, data) yang
 * "melayang" di atas foto hero beranda.
 *
 * Murni dekoratif: seluruh pembungkusnya `aria-hidden`, tanpa teks, jadi tidak
 * ada copy yang perlu tinggal di content/. Sejak G-37 ikonnya Iconsax (gratis,
 * subset build-time — components/icon-names.ts), bukan SVG gambar tangan.
 *
 * Warna dari token (`text-accent`, `text-ink-2`, `bg-surface`, `border-line`) —
 * dipasang di dalam blok `.tema-gelap`, jadi nilainya palet gelap di light maupun
 * dark mode. Gerak melayang hanya jalan dengan `motion-safe:` dan hanya xl+
 * (mati untuk prefers-reduced-motion).
 */

/** Nama bidang (dipakai beranda) → nama ikon Iconsax. */
const IKON = {
  code: "code",
  desain: "pen-tool",
  database: "data",
  cloud: "cloud",
  mobile: "mobile",
  data: "chart",
  terminal: "command",
  bentuk: "shapes",
  kilau: "magic-star",
  dasbor: "presention-chart",
} as const satisfies Record<string, IconName>;

export type NamaIkon = keyof typeof IKON;

/** Satu ikon bidang, dekoratif (`aria-hidden`). */
export function IkonBidang({
  nama,
  size = 24,
  type = "linear",
  className,
}: {
  nama: NamaIkon;
  size?: number;
  type?: "linear" | "bulk";
  className?: string;
}) {
  return <Icon name={IKON[nama]} size={size} type={type} className={className} />;
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
      <IkonBidang nama={nama} size={besar ? 28 : 20} type={aksen ? "bulk" : "linear"} />
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
