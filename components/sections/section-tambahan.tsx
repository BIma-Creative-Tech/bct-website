import type { SectionTambahan } from "@/content/copy";
import { DaftarPoin } from "./daftar-poin";
import { DaftarTanda } from "./daftar-tanda";
import { KepalaSection } from "./kepala-section";
import { SectionHalaman } from "./section-halaman";

/**
 * Section ekstra khas tiap produk (keamanan data, perawatan setelah go-live,
 * custom development, ...). Isinya mengikuti data copy: bisa `poin`, bisa
 * `daftar`, bisa hanya kepala + paragraf pengantar.
 */
export function BlokSectionTambahan({
  section,
  latar,
}: {
  section: SectionTambahan;
  latar?: "bg" | "surface";
}) {
  const idJudul = `judul-${section.id}`;

  return (
    <SectionHalaman idJudul={idJudul} latar={latar}>
      <KepalaSection kepala={section.kepala} idJudul={idJudul} />
      {section.poin ? <DaftarPoin poin={section.poin} /> : null}
      {section.daftar ? <DaftarTanda item={section.daftar} className="mt-10" /> : null}
    </SectionHalaman>
  );
}
