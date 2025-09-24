import { performance } from "node:perf_hooks";

real.fake = fake;

export default function real() {
  return {
    now() {
      return Date.now();
    },
    performanceNow() {
      return performance.now();
    },
    sinceMillis(past) {
      return Math.round(performance.now() - past);
    },
  };
}

export function fake() {
  const timestamp = 1231006505000;
  let ticks = 47695.741277;

  return {
    now() {
      return timestamp;
    },
    performanceNow() {
      return ticks++;
    },
    sinceMillis(past) {
      return Math.round(ticks++ - past);
    },
    inc(n) {
      ticks += n;
    },
    set(t) {
      ticks = t;
    },
  };
}
