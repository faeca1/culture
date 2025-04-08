import { test, expect, mock } from "bun:test";

import { asyncIterables as I } from "../lib/index.js";

test("toArray", async () => {
  await expect(I.toArray(primes())).resolves.toEqual([2, 3, 5, 7, 11, 13]);
});

test("map", async () => {
  const vals = I.map(async it => it * it)(primes());

  await expect(I.toArray(vals)).resolves.toEqual([4, 9, 25, 49, 121, 169]);
});


test("filter", async () => {
  const vals = I.filter(async it => it > 10)(primes());

  await expect(I.toArray(vals)).resolves.toEqual([11, 13]);
});


test("reject", async () => {
  const vals = I.reject(async it => it > 10)(primes());

  await expect(I.toArray(vals)).resolves.toEqual([2, 3, 5, 7]);
});


test("take", async () => {
  const vals = I.take(3)(primes());

  await expect(I.toArray(vals)).resolves.toEqual([2, 3, 5]);
});


test("forEach", async () => {
  const fn = mock(() => { });

  await I.forEach(fn)(primes());

  expect(fn.mock.calls).toEqual([[2], [3], [5], [7], [11], [13]]);
});


test("pipe", async () => {
  const pipeline = I.pipe(
    I.map(async it => it * it),
    I.filter(async it => it > 42),
    I.take(1),
  );
  const vals = pipeline(primes());

  await expect(I.toArray(vals)).resolves.toEqual([49]);
});


test("fluent", async () => {
  const vals = I(primes())
    .map(async it => it * it)
    .filter(async it => it > 42)
    .take(1);

  await expect(I.toArray(vals)).resolves.toEqual([49]);
});

test("apply", async () => {
  const fn = mock(() => { });

  await I.from(primes()).apply(I.forEach(fn));

  expect(fn.mock.calls).toEqual([[2], [3], [5], [7], [11], [13]]);
});


test("fluent from", async () => {
  const vals = I.from(primes())
    .map(async it => it * it)
    .filter(async it => it > 42)
    .take(1);

  await expect(I.toArray(vals)).resolves.toEqual([49]);
});


test("range", async () => {
  await expect(I.toArray(I.range(4, 2))).resolves.toEqual([4, 5]);
});


async function* primes() {
  yield 2;
  yield 3;
  yield 5;
  yield 7;
  yield 11;
  yield 13;
}

