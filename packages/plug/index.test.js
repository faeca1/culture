import { test, expect, describe } from "bun:test";
import { optional } from "./index.js";

describe("optional", () => {
  test("returns module if present", () => {
    expect(optional("debug")).toBeDefined();
  });

  test("does not throw on missing", () => {
    expect(() => optional("missing")).not.toThrow();
  });

  test("returns null", () => {
    expect(optional("missing")).toBeNull();
  });

  test("returns a default value if provided", () => {
    expect(optional("missing", Math.PI)).toEqual(Math.PI);
  });
});

