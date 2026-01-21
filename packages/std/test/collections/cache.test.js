import { describe, test, expect, mock } from "bun:test";
import _ from "../..";

describe("cache", () => {
  test("caches objects", async () => {
    const double = mock(x => ({ i: x, o: 2 * x }));
    const fn = _.collections.cache(x => x.i, double);

    expect(double).toHaveBeenCalledTimes(0);
    await fn(1);
    await fn(2);
    expect(double).toHaveBeenCalledTimes(2);
    await fn(1);
    await fn(2);
    expect(double).toHaveBeenCalledTimes(2);
    await fn(3);
    expect(double).toHaveBeenCalledTimes(3);
  });
});
