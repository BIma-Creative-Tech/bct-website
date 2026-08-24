import type { UntukSiapa } from "@/content/copy";
import { DaftarTanda } from "./daftar-tanda";

/**
 * Dua kolom penyaring calon klien: "cocok kalau" vs "belum cocok kalau".
 * Kepala sectionnya dirender terpisah oleh halaman lewat <KepalaSection>,
 * supaya pola komposisi section seragam di seluruh situs.
 */
export function KolomUntukSiapa({ untukSiapa }: { untukSiapa: UntukSiapa }) {
  return (
    <div className="mt-10 grid gap-10 sm:grid-cols-2">
      <div>
        <h3 className="font-display text-xl font-bold text-ink">{untukSiapa.labelCocok}</h3>
        <DaftarTanda item={untukSiapa.cocok} tanda="cocok" className="mt-5" />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-ink">{untukSiapa.labelBelumCocok}</h3>
        <DaftarTanda item={untukSiapa.belumCocok} tanda="belum" className="mt-5" />
      </div>
    </div>
  );
}
