import { describe, expect, it } from "vitest";
import { pecahAngka } from "@/lib/angka";
import { bukti, statistik } from "@/content/site";

describe("pecahAngka", () => {
  it("memecah angka + akhiran", () => {
    expect(pecahAngka("30+")).toEqual({ nilai: 30, akhiran: "+" });
    expect(pecahAngka("10+ tahun")).toEqual({ nilai: 10, akhiran: "+ tahun" });
    expect(pecahAngka("7")).toEqual({ nilai: 7, akhiran: "" });
  });
  it("teks non-angka → null (tampil apa adanya)", () => {
    expect(pecahAngka("KOMDIGI")).toBeNull();
    expect(pecahAngka("Retail")).toBeNull();
    expect(pecahAngka("")).toBeNull();
  });
  it("nilai + akhiran selalu menyusun ulang teks sumber content/site.ts (tanpa angka karangan)", () => {
    for (const item of [...statistik, ...bukti]) {
      const hasil = pecahAngka(item.angka);
      if (hasil) expect(`${hasil.nilai}${hasil.akhiran}`).toBe(item.angka);
    }
    expect(statistik.every((s) => pecahAngka(s.angka) !== null)).toBe(true);
  });
});
