import { describe, expect, it } from "vitest";
import { hasScoringOption, scoreSelection, SCORING_TABLE, scoringHints } from "../src/rules";

describe("scoreSelection", () => {
  it("scores singles, triples, and larger sets", () => {
    expect(scoreSelection([1])?.points).toBe(100);
    expect(scoreSelection([5])?.points).toBe(50);
    expect(scoreSelection([1, 1])?.points).toBe(200);
    expect(scoreSelection([5, 5])?.points).toBe(100);
    expect(scoreSelection([1, 1, 1])?.points).toBe(300);
    expect(scoreSelection([2, 2, 2])?.points).toBe(200);
    expect(scoreSelection([3, 3, 3])?.points).toBe(300);
    expect(scoreSelection([4, 4, 4])?.points).toBe(400);
    expect(scoreSelection([5, 5, 5])?.points).toBe(500);
    expect(scoreSelection([6, 6, 6])?.points).toBe(600);
    expect(scoreSelection([4, 4, 4, 4])?.points).toBe(1000);
    expect(scoreSelection([5, 5, 5, 5])?.points).toBe(1000);
    expect(scoreSelection([2, 2, 2, 2, 2])?.points).toBe(2000);
    expect(scoreSelection([6, 6, 6, 6, 6, 6])?.points).toBe(3000);
  });

  it("uses the six-dice combinations instead of the smaller split", () => {
    expect(scoreSelection([1, 2, 3, 4, 5, 6])?.points).toBe(1500);
    expect(scoreSelection([6, 5, 4, 3, 2, 1])?.points).toBe(1500);
    expect(scoreSelection([2, 2, 3, 3, 4, 4])?.points).toBe(1500);
    expect(scoreSelection([1, 1, 5, 5, 2, 2])?.points).toBe(1500);
    expect(scoreSelection([6, 6, 6, 6, 3, 3])?.points).toBe(1500);
    expect(scoreSelection([1, 1, 1, 1, 5, 5])?.points).toBe(1500);
    expect(scoreSelection([6, 6, 6, 5, 5, 5])?.points).toBe(2500);
    expect(scoreSelection([1, 1, 1, 5, 5, 5])?.points).toBe(2500);
  });

  it("adds mixed combinations from the same roll", () => {
    expect(scoreSelection([1, 4, 4, 4])?.points).toBe(500);
    expect(scoreSelection([2, 2, 2, 2, 1])?.points).toBe(1100);
    expect(scoreSelection([5, 5, 5, 5, 5, 1])?.points).toBe(2100);
    expect(scoreSelection([1, 1, 1, 1, 1, 5])?.points).toBe(2050);
    expect(scoreSelection([1, 5])?.points).toBe(150);
    expect(scoreSelection([2, 2, 2, 1, 1, 5])?.points).toBe(450);
  });

  it("rejects dice that do not score", () => {
    expect(scoreSelection([])).toBeNull();
    expect(scoreSelection([2])).toBeNull();
    expect(scoreSelection([2, 2])).toBeNull();
    expect(scoreSelection([2, 2, 2, 2, 3])).toBeNull();
    expect(scoreSelection([2, 2, 2, 2, 2, 3])).toBeNull();
    expect(scoreSelection([1, 2])).toBeNull();
  });
});

describe("scoringHints", () => {
  it("marks dice that belong to a scoring option without selecting them", () => {
    expect(scoringHints([1, 1, 1, 2, 3, 4])).toEqual([true, true, true, false, false, false]);
    expect(scoringHints([5, 5, 2, 3, 4, 6])).toEqual([true, true, false, false, false, false]);
    expect(scoringHints([4, 4, 4, 4, 2, 3])).toEqual([true, true, true, true, false, false]);
    expect(scoringHints([2, 2, 2, 2, 2, 3])).toEqual([true, true, true, true, true, false]);
    expect(scoringHints([1, 2, 3, 4, 5, 6]).every(Boolean)).toBe(true);
    expect(scoringHints([2, 2, 3, 3, 4, 4]).every(Boolean)).toBe(true);
    expect(scoringHints([4, 4, 4, 4, 2, 2]).every(Boolean)).toBe(true);
    expect(scoringHints([2, 2, 2, 4, 4, 4]).every(Boolean)).toBe(true);
    expect(scoringHints([2, 2, 3, 3, 4, 6]).some(Boolean)).toBe(false);
    expect(hasScoringOption([2])).toBe(false);
    expect(hasScoringOption([5])).toBe(true);
  });
});

describe("scoring table", () => {
  it("lists every combination from the rules sheet", () => {
    expect(SCORING_TABLE).toEqual([
      { combination: "Single 1", points: 100 },
      { combination: "Single 5", points: 50 },
      { combination: "Three 1s", points: 300 },
      { combination: "Three 2s", points: 200 },
      { combination: "Three 3s", points: 300 },
      { combination: "Three 4s", points: 400 },
      { combination: "Three 5s", points: 500 },
      { combination: "Three 6s", points: 600 },
      { combination: "Four of a kind", points: 1000 },
      { combination: "Five of a kind", points: 2000 },
      { combination: "Six of a kind", points: 3000 },
      { combination: "Straight 1–6", points: 1500 },
      { combination: "Three pairs", points: 1500 },
      { combination: "Four of a kind with a pair", points: 1500 },
      { combination: "Two triplets", points: 2500 },
    ]);
  });
});
