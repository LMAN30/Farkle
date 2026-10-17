# Farkle

Pass-and-play Farkle for two or more players on one screen. Scoring follows the PlayMonster rules.

## Start

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

## Tests

```bash
npm test
npm run e2e
```

## Rules in this table

- Single 1 = 100, single 5 = 50.
- Three of a kind: 1s = 300, 2s = 200, 3s = 300, 4s = 400, 5s = 500, 6s = 600.
- Four of a kind = 1,000. Five = 2,000. Six = 3,000.
- Straight 1–6 = 1,500. Three pairs = 1,500. Four of a kind with a pair = 1,500. Two triplets = 2,500.
- Combinations come from one roll only. Keep at least one scoring die each roll.
- Hot dice: set aside all six and you may roll all six again, adding to the turn.
- A roll with no scoring dice is a Farkle. The turn score is lost. Banked points stay.
- The first bank must be 500 or more. Later turns may bank any amount.
- At 10,000 or more, every other player gets one last turn. Highest score wins. A tie stands.
