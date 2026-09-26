import { describe, expect, it } from "vitest";
import { BATAS_ISIAN } from "@/app/api/lead/batas";

describe("vitest terpasang", () => {
  it("alias @ menunjuk root repo", () => {
    expect(BATAS_ISIAN.nama.min).toBeGreaterThan(0);
  });
});
