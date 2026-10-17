import { describe, expect, it } from "vitest";
import { comboTier } from "../src/audio";
import { bestAvailableScore } from "../src/rules";

describe("comboTier", () => {
  it("scales epicness with points", () => {
    expect(comboTier(50)).toBe("small");
    expect(comboTier(100)).toBe("small");
    expect(comboTier(300)).toBe("medium");
    expect(comboTier(600)).toBe("medium");
    expect(comboTier(1000)).toBe("big");
    expect(comboTier(1500)).toBe("epic");
    expect(comboTier(2000)).toBe("epic");
    expect(comboTier(2500)).toBe("legendary");
    expect(comboTier(3000)).toBe("legendary");
  });
});

describe("bestAvailableScore", () => {
  it("scores every scoring die on the roll", () => {
    expect(bestAvailableScore([1, 1, 1, 2, 3, 4])?.points).toBe(300);
    expect(bestAvailableScore([5, 2, 3, 4, 6, 6])?.points).toBe(50);
    expect(bestAvailableScore([1, 2, 3, 4, 5, 6])?.points).toBe(1500);
    expect(bestAvailableScore([1, 1, 1, 1, 1, 1])?.points).toBe(3000);
    expect(bestAvailableScore([2, 3, 4, 6, 2, 3])).toBeNull();
  });
});
