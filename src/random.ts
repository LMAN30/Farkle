interface FarkleTestHooks {
  __FARKLE_QUEUE?: number[];
  __FARKLE_FAST?: boolean;
  /** Override Farkle overlay auto-dismiss delay in ms (tests). */
  __FARKLE_AUTO_MS?: number;
}

function hooks(): FarkleTestHooks {
  return globalThis as FarkleTestHooks;
}

export function isFast(): boolean {
  return Boolean(hooks().__FARKLE_FAST);
}

/** How long the Farkle overlay stays up before advancing. Default 2 seconds. */
export function farkleAutoMs(normal = 2000, fast = 10_000): number {
  const override = hooks().__FARKLE_AUTO_MS;
  if (typeof override === "number" && Number.isFinite(override) && override >= 0) return override;
  return isFast() ? fast : normal;
}

/** Next faces. Tests can preload `globalThis.__FARKLE_QUEUE`. */
export function rollFaces(count: number): number[] {
  const queue = hooks().__FARKLE_QUEUE;
  const faces: number[] = [];
  for (let i = 0; i < count; i += 1) {
    if (queue && queue.length > 0) {
      const next = queue.shift();
      if (!Number.isInteger(next) || next! < 1 || next! > 6) {
        throw new Error(`Forced die out of range: ${String(next)}`);
      }
      faces.push(next!);
      continue;
    }
    if (isFast()) {
      throw new Error(`Ran out of forced dice while rolling ${count}.`);
    }
    faces.push(1 + Math.floor(Math.random() * 6));
  }
  return faces;
}
