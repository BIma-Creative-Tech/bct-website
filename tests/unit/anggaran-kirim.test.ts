import { describe, expect, it } from "vitest";
import { ANGGARAN_KIRIM } from "@/app/api/lead/batas";
import { buatAnggaran } from "@/lib/anggaran-kirim";

/** Anggaran kirim /api/lead (G-42): situs per jam (ember token + jendela geser) + IP per hari. */
const MENIT = 60_000;
const JAM = 60 * MENIT;

function ipUnik() {
  let n = 0;
  return () => `ip:198.51.100.${++n}`;
}

describe("buatAnggaran — atap situs", () => {
  it("angka bawaan di bawah batas mailbox (30/jam, ledakan 10) dengan margin", () => {
    expect(ANGGARAN_KIRIM.perJam).toBe(20);
    expect(ANGGARAN_KIRIM.ledakan).toBe(8);
    expect(ANGGARAN_KIRIM.perIpPerHari).toBe(3);
    expect(ANGGARAN_KIRIM.perJam).toBeLessThan(30);
    expect(ANGGARAN_KIRIM.ledakan).toBeLessThan(10);
  });

  it("ledakan: 8 kiriman serentak lolos, ke-9 ditolak; token kembali 1 per 3 menit", () => {
    const a = buatAnggaran(ANGGARAN_KIRIM);
    const ip = ipUnik();
    const t0 = 1_000_000;
    const hasil = Array.from({ length: 9 }, () => a.coba(ip(), t0));
    expect(hasil).toEqual([...Array(8).fill(true), false]);
    expect(a.coba(ip(), t0 + 2 * MENIT)).toBe(false);
    expect(a.coba(ip(), t0 + 3 * MENIT)).toBe(true);
    expect(a.coba(ip(), t0 + 3 * MENIT)).toBe(false);
  });

  it("jendela geser: paling banyak 20 dalam 60 menit mana pun, walau ember token penuh", () => {
    const a = buatAnggaran(ANGGARAN_KIRIM);
    const ip = ipUnik();
    const t0 = 5_000_000;
    let lolos = 0;
    // Satu kiriman tiap 90 s selama 2 jam: ember selalu penuh, jendela yang membatasi.
    const waktu: number[] = [];
    for (let t = t0; t < t0 + 2 * JAM; t += 90_000) {
      if (a.coba(ip(), t)) {
        lolos += 1;
        waktu.push(t);
      }
    }
    for (const mulai of waktu) {
      expect(waktu.filter((w) => w >= mulai && w < mulai + JAM).length).toBeLessThanOrEqual(20);
    }
    expect(lolos).toBeGreaterThanOrEqual(30); // ±20/jam, tidak dikunci permanen
  });

  it("dalam SETIAP selang t, kiriman ≤ 10 + 30·t/jam (ember mailbox tidak pernah terkuras situs)", () => {
    const a = buatAnggaran(ANGGARAN_KIRIM);
    const ip = ipUnik();
    const waktu: number[] = [];
    // Serangan rakus: coba tiap 10 s selama 3 jam.
    for (let t = 0; t < 3 * JAM; t += 10_000) if (a.coba(ip(), t)) waktu.push(t);
    for (let i = 0; i < waktu.length; i++) {
      for (let j = i; j < waktu.length; j++) {
        const selang = (waktu[j] as number) - (waktu[i] as number);
        expect(j - i + 1).toBeLessThanOrEqual(10 + (30 * selang) / JAM + 1e-9);
      }
    }
  });
});

describe("buatAnggaran — atap per IP per hari", () => {
  it("3 per IP per 24 jam; reset sesudah 24 jam; IP lain tidak terpengaruh", () => {
    const a = buatAnggaran({ perJam: 1_000, ledakan: 1_000, perIpPerHari: 3 });
    const t0 = 0;
    expect([1, 2, 3, 4].map((i) => a.coba("ip:203.0.113.9", t0 + i))).toEqual([true, true, true, false]);
    expect(a.coba("ip:203.0.113.10", t0 + 5)).toBe(true);
    expect(a.coba("ip:203.0.113.9", t0 + 24 * JAM - 1)).toBe(false);
    expect(a.coba("ip:203.0.113.9", t0 + 1 + 24 * JAM)).toBe(true);
  });

  it("penolakan per-IP tidak memakan token situs", () => {
    const a = buatAnggaran({ perJam: 20, ledakan: 4, perIpPerHari: 1 });
    expect(a.coba("ip:a", 0)).toBe(true);
    for (let i = 0; i < 10; i++) expect(a.coba("ip:a", 0)).toBe(false);
    expect([a.coba("ip:b", 0), a.coba("ip:c", 0), a.coba("ip:d", 0)]).toEqual([true, true, true]);
    expect(a.coba("ip:e", 0)).toBe(false); // 4 token situs habis oleh a,b,c,d — bukan oleh 10 tolakan
  });

  it("tanpa identitas (null) hanya tunduk atap situs", () => {
    const a = buatAnggaran({ perJam: 20, ledakan: 5, perIpPerHari: 1 });
    expect(Array.from({ length: 6 }, () => a.coba(null, 0))).toEqual([true, true, true, true, true, false]);
  });

  it("Map IP penuh: IP baru tetap tunduk atap situs (tidak tumbuh tanpa batas)", () => {
    const a = buatAnggaran({ perJam: 100, ledakan: 100, perIpPerHari: 1, maksEntriIp: 2 });
    expect([a.coba("ip:1", 0), a.coba("ip:2", 0), a.coba("ip:3", 0), a.coba("ip:3", 0)]).toEqual([
      true,
      true,
      true,
      true,
    ]);
    expect(a.coba("ip:1", 0)).toBe(false);
  });
});
