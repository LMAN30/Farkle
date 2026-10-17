/** Web Audio cues for Farkle — no asset files. */

let shared: AudioContext | null = null;
let rollCleanup: (() => void) | null = null;

function audioContext(): AudioContext | null {
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!shared || shared.state === "closed") shared = new AC();
  if (shared.state === "suspended") void shared.resume();
  return shared;
}

function bump(
  hook:
    | "__FARKLE_SOUND_PLAYED"
    | "__FARKLE_ROLL_SOUND"
    | "__FARKLE_COMBO_SOUND"
    | "__FARKLE_BANK_SOUND"
    | "__FARKLE_OPENING_BANK_SOUND",
): void {
  const hooks = globalThis as Record<string, number | undefined>;
  hooks[hook] = (hooks[hook] ?? 0) + 1;
}

export type ComboTier = "small" | "medium" | "big" | "epic" | "legendary";

/** Bigger point totals get louder, longer, richer fanfares. */
export function comboTier(points: number): ComboTier {
  if (points >= 2500) return "legendary";
  if (points >= 1500) return "epic";
  if (points >= 1000) return "big";
  if (points >= 300) return "medium";
  return "small";
}

export function stopDiceRollSound(): void {
  rollCleanup?.();
  rollCleanup = null;
}

/** Clattery rattle while dice tumble. */
export function startDiceRollSound(durationMs: number): void {
  stopDiceRollSound();
  bump("__FARKLE_ROLL_SOUND");
  try {
    const ctx = audioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const seconds = Math.max(0.08, durationMs / 1000);
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
    master.gain.setValueAtTime(0.22, now + seconds * 0.75);
    master.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    master.connect(ctx.destination);

    const bufferSize = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      const t = i / ctx.sampleRate;
      const envelope = Math.sin((Math.PI * t) / seconds);
      const click = Math.random() > 0.86 ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 2 - 1) * 0.12;
      data[i] = click * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.linearRampToValueAtTime(900, now + seconds);
    filter.Q.value = 1.2;
    noise.connect(filter);
    filter.connect(master);
    noise.start(now);
    noise.stop(now + seconds);

    const tick = window.setInterval(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime;
        osc.type = "triangle";
        osc.frequency.value = 420 + Math.random() * 520;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 0.06);
      } catch {
        // ignore mid-roll glitches
      }
    }, 55);

    rollCleanup = () => {
      window.clearInterval(tick);
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.02);
        noise.stop();
      } catch {
        // already stopped
      }
    };
    window.setTimeout(() => {
      if (rollCleanup) stopDiceRollSound();
    }, durationMs + 40);
  } catch {
    // Autoplay policies or missing AudioContext should not break play.
  }
}

export function playFarkleSound(): void {
  bump("__FARKLE_SOUND_PLAYED");
  try {
    const ctx = audioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 1.7;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(ctx.destination);

    for (const [freq, type, detune] of [
      [110, "sawtooth", 0],
      [165, "square", 18],
      [82.5, "triangle", -12],
    ] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 1.4);
      osc.detune.setValueAtTime(detune, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration);
    }
  } catch {
    // Autoplay policies or missing AudioContext should not break play.
  }
}

type Fanfare = {
  notes: number[];
  duration: number;
  volume: number;
  voices: number;
  shimmer: boolean;
};

function fanfareFor(tier: ComboTier): Fanfare {
  switch (tier) {
    case "small":
      return { notes: [523.25, 659.25], duration: 0.28, volume: 0.16, voices: 1, shimmer: false };
    case "medium":
      return { notes: [392, 523.25, 659.25], duration: 0.45, volume: 0.2, voices: 2, shimmer: false };
    case "big":
      return { notes: [349.23, 440, 554.37, 698.46], duration: 0.7, volume: 0.26, voices: 2, shimmer: true };
    case "epic":
      return {
        notes: [261.63, 329.63, 392, 523.25, 659.25, 783.99],
        duration: 1.05,
        volume: 0.3,
        voices: 3,
        shimmer: true,
      };
    case "legendary":
      return {
        notes: [196, 246.94, 311.13, 392, 493.88, 587.33, 739.99, 987.77],
        duration: 1.45,
        volume: 0.36,
        voices: 4,
        shimmer: true,
      };
  }
}

/** Bright fanfare scaled by how big the scored combination is. */
export function playComboSound(points: number): void {
  bump("__FARKLE_COMBO_SOUND");
  if (!Number.isFinite(points) || points <= 0) return;
  try {
    const ctx = audioContext();
    if (!ctx) return;
    const tier = comboTier(points);
    const fanfare = fanfareFor(tier);
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(fanfare.volume, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + fanfare.duration);
    master.connect(ctx.destination);

    const step = fanfare.duration / (fanfare.notes.length + 0.5);
    fanfare.notes.forEach((freq, index) => {
      const start = now + index * step * 0.55;
      for (let voice = 0; voice < fanfare.voices; voice += 1) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = voice === 0 ? "triangle" : voice === 1 ? "square" : "sawtooth";
        osc.frequency.setValueAtTime(freq * (1 + voice * 0.01), start);
        if (tier === "legendary" || tier === "epic") {
          osc.frequency.exponentialRampToValueAtTime(freq * 1.03, start + step);
        }
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18 / fanfare.voices, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + step * 1.4);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(start + step * 1.5);
      }
    });

    if (fanfare.shimmer) {
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(1200, now);
      shimmer.frequency.exponentialRampToValueAtTime(2400, now + fanfare.duration * 0.8);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + fanfare.duration);
      shimmer.connect(gain);
      gain.connect(master);
      shimmer.start(now);
      shimmer.stop(now + fanfare.duration);
    }
  } catch {
    // Autoplay policies or missing AudioContext should not break play.
  }
}

/** Warm coin settle for a normal bank; triumphant fanfare when opening the board. */
export function playBankSound(opening: boolean): void {
  bump(opening ? "__FARKLE_OPENING_BANK_SOUND" : "__FARKLE_BANK_SOUND");
  try {
    const ctx = audioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (opening) {
      const duration = 1.2;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.34, now + 0.03);
      master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      master.connect(ctx.destination);

      const chord = [196, 246.94, 293.66, 392, 493.88];
      chord.forEach((freq, index) => {
        const start = now + index * 0.07;
        for (const [type, mult, vol] of [
          ["triangle", 1, 0.16],
          ["sine", 2, 0.07],
        ] as const) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq * mult, start);
          osc.frequency.exponentialRampToValueAtTime(freq * mult * 1.04, start + 0.35);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(vol, start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
          osc.connect(gain);
          gain.connect(master);
          osc.start(start);
          osc.stop(start + 0.75);
        }
      });

      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = "sine";
      bell.frequency.setValueAtTime(880, now + 0.35);
      bell.frequency.exponentialRampToValueAtTime(1320, now + 0.9);
      bellGain.gain.setValueAtTime(0.0001, now + 0.35);
      bellGain.gain.exponentialRampToValueAtTime(0.12, now + 0.4);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      bell.connect(bellGain);
      bellGain.connect(master);
      bell.start(now + 0.35);
      bell.stop(now + duration);
      return;
    }

    const duration = 0.45;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.24, now + 0.015);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(ctx.destination);

    for (const [freq, delay] of [
      [660, 0],
      [880, 0.06],
      [1100, 0.12],
    ] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + delay;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, start + 0.2);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.3);
    }
  } catch {
    // Autoplay policies or missing AudioContext should not break play.
  }
}
