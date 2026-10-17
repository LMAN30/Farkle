# Farkle

Pass-and-play Farkle for two or more players on one screen. Scoring follows the PlayMonster rules.

Works as a web app and as a full-screen **iPhone app** via Add to Home Screen.

## Start

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

## Install on iPhone

1. Deploy or open the site over **HTTPS** in **Safari** (required for home-screen apps).
2. Tap the Share button.
3. Choose **Add to Home Screen**, then **Add**.
4. Open **Farkle** from your home screen — it launches full screen like a native app (no Safari chrome), works offline after the first visit, and uses the dice icon.

On iPhone Safari you’ll also see a short in-app tip until you dismiss it.

Production build:

```bash
npm run build
npm run preview
```

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
