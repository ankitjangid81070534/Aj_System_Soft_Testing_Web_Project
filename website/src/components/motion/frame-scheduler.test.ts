import { describe, expect, it, vi } from "vitest";
import { createFrameScheduler } from "./frame-scheduler";

function harness() {
  let id = 0;
  const queued = new Map<number, FrameRequestCallback>();
  const update = vi.fn();
  const request = vi.fn((callback: FrameRequestCallback) => { const next = id++; queued.set(next, callback); return next; });
  const cancel = vi.fn((frame: number) => { queued.delete(frame); });
  const scheduler = createFrameScheduler(update, request, cancel);
  const flush = () => { const callbacks = [...queued.values()]; queued.clear(); callbacks.forEach(callback => callback(16)); };
  return { scheduler, update, request, cancel, queued, flush };
}

describe("event-driven frame scheduler", () => {
  it("coalesces event bursts, including frame id zero", () => {
    const h = harness();
    for (let i = 0; i < 50; i++) h.scheduler.schedule();
    expect(h.request).toHaveBeenCalledTimes(1);
    h.flush(); expect(h.update).toHaveBeenCalledTimes(1);
  });
  it("returns to idle instead of scheduling an endless loop", () => {
    const h = harness(); h.scheduler.schedule(); h.flush();
    expect(h.queued.size).toBe(0); expect(h.request).toHaveBeenCalledTimes(1);
  });
  it("allows the next event to request a new frame", () => {
    const h = harness(); h.scheduler.schedule(); h.flush(); h.scheduler.schedule(); h.flush();
    expect(h.update).toHaveBeenCalledTimes(2);
  });
  it("cancels pending work on cleanup", () => {
    const h = harness(); h.scheduler.schedule(); h.scheduler.cancel(); h.flush();
    expect(h.cancel).toHaveBeenCalledWith(0); expect(h.update).not.toHaveBeenCalled();
  });
  it("can restart after cancellation, without retaining stale work", () => {
    const h = harness(); h.scheduler.schedule(); h.scheduler.cancel(); h.scheduler.schedule(); h.flush();
    expect(h.update).toHaveBeenCalledTimes(1);
  });
  it("has idempotent cancellation when idle", () => {
    const h = harness(); h.scheduler.cancel(); h.scheduler.cancel();
    expect(h.cancel).not.toHaveBeenCalled();
  });
});
