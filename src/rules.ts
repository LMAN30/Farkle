/** PlayMonster Farkle scoring. Combinations count only within a single roll. */

export const OPENING_SCORE = 500;
export const WINNING_SCORE = 10_000;

export interface ScoreResult {
  points: number;
  parts: string[];
}

export const SCORING_TABLE: { combination: string; points: number }[] = [
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
];

const TRIPLE_POINTS: Record<number, number> = {
  1: 300,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  6: 600,
};

export function formatPoints(points: number): string {
  return points.toLocaleString("en-US");
}

function counts(dice: number[]): number[] {
  const freq = [0, 0, 0, 0, 0, 0, 0];
  for (const face of dice) {
    if (!Number.isInteger(face) || face < 1 || face > 6) {
      throw new Error(`Invalid die face: ${face}`);
    }
    freq[face] += 1;
  }
  return freq;
}

function isStraight(freq: number[]): boolean {
  return [1, 2, 3, 4, 5, 6].every((face) => freq[face] === 1);
}

function isSixOfAKind(freq: number[]): boolean {
  return freq.some((count) => count === 6);
}

function isTwoTriplets(freq: number[]): boolean {
  return freq.filter((count) => count === 3).length === 2;
}

function isThreePairs(freq: number[]): boolean {
  return freq.filter((count) => count === 2).length === 3;
}

function isFourAndPair(freq: number[]): boolean {
  return freq.some((count) => count === 4) && freq.some((count) => count === 2);
}

/**
 * Score dice the player chose from one roll.
 * Returns null when any chosen die is not part of a scoring combination.
 * Six-dice patterns use the sheet value, which is higher than splitting them up.
 */
export function scoreSelection(dice: number[]): ScoreResult | null {
  if (dice.length === 0) return null;
  const freq = counts(dice);

  if (dice.length === 6) {
    if (isStraight(freq)) return { points: 1500, parts: ["Straight 1–6 (1,500)"] };
    if (isSixOfAKind(freq)) return { points: 3000, parts: ["Six of a kind (3,000)"] };
    if (isTwoTriplets(freq)) return { points: 2500, parts: ["Two triplets (2,500)"] };
    if (isThreePairs(freq)) return { points: 1500, parts: ["Three pairs (1,500)"] };
    if (isFourAndPair(freq)) return { points: 1500, parts: ["Four of a kind with a pair (1,500)"] };
  }

  const left = freq.slice();
  let points = 0;
  const parts: string[] = [];

  for (let face = 1; face <= 6; face += 1) {
    const count = left[face];
    if (count < 3) continue;
    let partPoints = 0;
    let label = "";
    if (count === 3) {
      partPoints = TRIPLE_POINTS[face];
      label = `Three ${face}s (${formatPoints(partPoints)})`;
    } else if (count === 4) {
      partPoints = 1000;
      label = `Four ${face}s (1,000)`;
    } else if (count === 5) {
      partPoints = 2000;
      label = `Five ${face}s (2,000)`;
    } else if (count === 6) {
      partPoints = 3000;
      label = `Six ${face}s (3,000)`;
    } else {
      return null;
    }
    points += partPoints;
    parts.push(label);
    left[face] = 0;
  }

  if (left[1] > 0) {
    const partPoints = left[1] * 100;
    points += partPoints;
    parts.push(left[1] === 1 ? "Single 1 (100)" : `${left[1]} single 1s (${formatPoints(partPoints)})`);
    left[1] = 0;
  }
  if (left[5] > 0) {
    const partPoints = left[5] * 50;
    points += partPoints;
    parts.push(left[5] === 1 ? "Single 5 (50)" : `${left[5]} single 5s (${formatPoints(partPoints)})`);
    left[5] = 0;
  }

  if (left.some((count) => count > 0) || points <= 0) return null;
  return { points, parts };
}

/** True when that die belongs to at least one legal scoring option on this roll. */
export function scoringHints(dice: number[]): boolean[] {
  if (dice.length === 0) return [];
  const freq = counts(dice);
  if (
    dice.length === 6 &&
    (isStraight(freq) || isSixOfAKind(freq) || isTwoTriplets(freq) || isThreePairs(freq) || isFourAndPair(freq))
  ) {
    return dice.map(() => true);
  }
  return dice.map((face) => face === 1 || face === 5 || freq[face] >= 3);
}

export function hasScoringOption(dice: number[]): boolean {
  return scoringHints(dice).some(Boolean);
}
