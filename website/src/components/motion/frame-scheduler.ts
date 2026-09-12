/** Coalesce event bursts into one read/update per frame. No persistent loop. */
export function createFrameScheduler(
  update: () => void,
  request: (callback: FrameRequestCallback) => number = requestAnimationFrame,
  cancel: (id: number) => void = cancelAnimationFrame,
) {
  let frame: number | null = null;
  return {
    schedule() {
      if (frame !== null) return;
      frame = request(() => { frame = null; update(); });
    },
    cancel() {
      if (frame !== null) cancel(frame);
      frame = null;
    },
  };
}
