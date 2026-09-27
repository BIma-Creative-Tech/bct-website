/**
 * Anggaran kirim `/api/lead` (G-42, menutup H-1): atap SITUS per jam (ember token + jendela
 * geser) dan atap per IP per hari. Angka dan alasannya di `ANGGARAN_KIRIM`
 * (app/api/lead/batas.ts).
 *
 * `coba()` memeriksa SEMUA atap dulu lalu mengonsumsi semuanya sekaligus — penolakan oleh
 * satu atap tidak pernah memakan jatah atap lain (mis. IP yang sudah 3 kali hari ini tidak
 * ikut menghabiskan token situs).
 *
 * Dibuat sebagai pabrik dengan jam yang bisa disuntik supaya uji tidak perlu menunggu jam
 * sungguhan; route memakai satu instans per proses.
 */
export type OpsiAnggaran = {
  perJam: number;
  ledakan: number;
  perIpPerHari: number;
  /** Pagar memori Map per-IP. */
  maksEntriIp?: number;
};

const JAM_MS = 60 * 60 * 1_000;
const HARI_MS = 24 * JAM_MS;

export type Anggaran = {
  /**
   * `kunciIp` = identitas IP tepercaya (sudah dinormalisasi), atau `null` untuk trafik tanpa
   * identitas — yang itu hanya tunduk pada atap situs. `true` = boleh kirim, jatah terpakai.
   */
  coba(kunciIp: string | null, sekarang?: number): boolean;
};

export function buatAnggaran(opsi: OpsiAnggaran): Anggaran {
  const maksEntriIp = opsi.maksEntriIp ?? 5_000;
  const lajuPerMs = opsi.perJam / JAM_MS;
  let token = opsi.ledakan;
  let terakhirIsi: number | null = null;
  /** Waktu kiriman dalam 60 menit terakhir (≤ perJam entri). */
  const log: number[] = [];
  const perIp = new Map<string, { jumlah: number; reset: number }>();

  function isiUlang(sekarang: number): void {
    if (terakhirIsi !== null && sekarang > terakhirIsi) {
      token = Math.min(opsi.ledakan, token + (sekarang - terakhirIsi) * lajuPerMs);
    }
    terakhirIsi = sekarang;
    while (log.length > 0 && sekarang - (log[0] as number) >= JAM_MS) log.shift();
  }

  function entriIp(kunci: string, sekarang: number) {
    const entri = perIp.get(kunci);
    if (entri && sekarang < entri.reset) return entri;
    return null;
  }

  return {
    coba(kunciIp, sekarang = Date.now()) {
      isiUlang(sekarang);
      if (token < 1 || log.length >= opsi.perJam) return false;

      let pakaiIp = kunciIp !== null;
      const entri = kunciIp ? entriIp(kunciIp, sekarang) : null;
      if (entri && entri.jumlah >= opsi.perIpPerHari) return false;
      if (kunciIp && !entri && !perIp.has(kunciIp) && perIp.size >= maksEntriIp) {
        for (const [k, e] of perIp) if (sekarang >= e.reset) perIp.delete(k);
        // Map masih penuh (≥ maksEntriIp IP berbeda dalam 24 jam): atap situs tetap berlaku
        // dan jauh lebih ketat daripada ini, jadi IP baru cukup tunduk pada atap situs.
        if (perIp.size >= maksEntriIp) pakaiIp = false;
      }

      token -= 1;
      log.push(sekarang);
      if (pakaiIp && kunciIp) {
        if (entri) entri.jumlah += 1;
        else perIp.set(kunciIp, { jumlah: 1, reset: sekarang + HARI_MS });
      }
      return true;
    },
  };
}
