/** Short dissonant sting for the Farkle overlay. Uses Web Audio — no asset files. */

let shared: AudioContext | null = null;

function audioContext(): AudioContext | null {
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!shared || shared.state === "closed") shared = new AC();
  if (shared.state === "suspended") void shared.resume();
  return shared;
}

export function playFarkleSound(): void {
  const hooks = globalThis as { __FARKLE_SOUND_PLAYED?: number };
  hooks.__FARKLE_SOUND_PLAYED = (hooks.__FARKLE_SOUND_PLAYED ?? 0) + 1;
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
