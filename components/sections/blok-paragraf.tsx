import { kelas } from "@/components/styles";

/**
 * Blok paragraf naratif lepas — tanpa kartu, tanpa butir, tanpa ikon.
 *
 * Dipakai section yang isinya memang prosa (mis. "posisi" dan "siapa yang
 * mengerjakan" di /tentang), di mana memecah kalimat jadi kartu justru merusak
 * alur bacanya. Lebar dibatasi ±65ch sesuai aturan kerja no.1 CLAUDE.md.
 *
 * Komponen ini tidak menyimpan teks apa pun; `paragraf` datang dari content/copy.
 * Key memakai isi paragraf (bukan index) karena copy statis dan tiap paragraf unik.
 */
export function BlokParagraf({
  paragraf,
  className,
}: {
  paragraf: string[];
  className?: string;
}) {
  return (
    <div className={kelas("mt-8 max-w-[65ch] space-y-5 text-ink-2", className)}>
      {paragraf.map((teks) => (
        <p key={teks}>{teks}</p>
      ))}
    </div>
  );
}
