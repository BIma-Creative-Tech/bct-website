import { Eyebrow } from "@/components/eyebrow";
import type { KepalaSection as KepalaSectionCopy } from "@/content/copy";
import { kelasJudulSection, kelasParagrafSection } from "./kelas-section";

/**
 * Kepala section: eyebrow mono + <h2> + paragraf pengantar opsional.
 *
 * Seluruh teksnya berasal dari content/copy. `idJudul` dipasang di <h2> agar
 * bisa dirujuk `aria-labelledby` milik <SectionHalaman>.
 */
export function KepalaSection({
  kepala,
  idJudul,
}: {
  kepala: KepalaSectionCopy;
  idJudul: string;
}) {
  return (
    <>
      <Eyebrow>{kepala.eyebrow}</Eyebrow>
      <h2 id={idJudul} className={kelasJudulSection}>
        {kepala.judul}
      </h2>
      {kepala.teks ? <p className={kelasParagrafSection}>{kepala.teks}</p> : null}
    </>
  );
}
