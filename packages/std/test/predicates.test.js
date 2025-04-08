import { test, expect } from "bun:test";

import { predicates as P } from "../lib/index.js";

test("and", () => {
  const pred = P.and(it => it > 10, it => it % 2 == 0);

  expect(pred(12)).toBe(true);
  expect(pred(11)).toBe(false);
  expect(pred(9)).toBe(false);
  expect(pred(8)).toBe(false);
});


test("not", () => {
  const pred = P.not(it => it > 10);

  expect(pred(12)).toBe(false);
  expect(pred(11)).toBe(false);
  expect(pred(9)).toBe(true);
  expect(pred(8)).toBe(true);
});

test("or", () => {
  const pred = P.or(it => it > 10, it => it % 2 == 0);

  expect(pred(12)).toBe(true);
  expect(pred(11)).toBe(true);
  expect(pred(9)).toBe(false);
  expect(pred(8)).toBe(true);
});

