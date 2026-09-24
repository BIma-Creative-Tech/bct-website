import { kartuInteraktif, kelas } from "@/components/styles";
import { WaButton } from "@/components/wa-button";
import type { Paket } from "@/content/site";
import { DaftarTanda } from "./daftar-tanda";

/**
 * Kartu paket/harga. SELURUH isinya (nama, harga, satuan, deskripsi, fitur, pesan
 * prefill WhatsApp) dirender dari `produk[].paket` di content/site.ts — tidak ada
 * satu pun angka harga yang diketik di komponen ini.
 *
 * `labelCta` sengaja jadi prop, bukan diimpor dari content/copy: komponen ini harus
 * bebas teks agar bisa dipakai ulang /pricing. Tipe `Paket` hanya menyimpan
 * `ctaPesan` tanpa label tombol — lihat catatan untuk owner di laporan W2-01.
 * Karena tombolnya berulang, pembedanya ditaruh di aria-label (nama paket dari site.ts).
 */
export function DaftarPaket({
  paket,
  labelCta,
  levelJudul = "h3",
  className = "mt-10",
}: {
  /** `readonly`: `produk[]` di content/site.ts dideklarasikan `as const`. */
  paket: readonly Paket[];
  labelCta: string;
  /**
   * Tingkat heading nama paket. Default "h3" (dipasang langsung di bawah <h2>
   * section, seperti di halaman produk). Naikkan ke "h4" bila kartu berada di bawah
   * judul kelompok <h3> — dipakai /pricing yang mengelompokkan paket per produk,
   * supaya urutan heading tidak jadi datar.
   */
  levelJudul?: "h3" | "h4";
  /**
   * Kelas pembungkus <ul>. Default "mt-10" (jarak standar dari kepala section).
   * Diisi pemanggil bila jarak atasnya perlu berbeda — sengaja MENGGANTI, bukan
   * menambah, agar tidak ada dua utilitas margin yang saling bertabrakan.
   */
  className?: string;
}) {
  const JudulPaket = levelJudul;

  return (
    <ul className={kelas("grid gap-4 sm:grid-cols-2", className)}>
      {paket.map((item) => (
        <li
          key={item.nama}
          className={kelas(
            "muncul-saat-gulir flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8",
            kartuInteraktif,
          )}
        >
          <JudulPaket className="font-display text-xl font-bold text-ink">{item.nama}</JudulPaket>

          <p className="mt-4 font-mono text-2xl font-semibold text-ink">
            {item.harga}
            {item.satuan ? <span className="text-base text-muted">{item.satuan}</span> : null}
          </p>

          <p className="mt-3 text-sm text-ink-2">{item.deskripsi}</p>

          <DaftarTanda item={item.fitur} className="mt-6 flex-1 border-t border-line pt-6" />

          <WaButton
            pesan={item.ctaPesan}
            ariaLabel={`${labelCta} — ${item.nama}`}
            className="mt-8"
          >
            {labelCta}
          </WaButton>
        </li>
      ))}
    </ul>
  );
}
