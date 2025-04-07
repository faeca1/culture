import { describe, expect, test, mock } from "bun:test";
import sql from "../lib/sql.js";

describe("sql", () => {
  describe("thunk", () => {
    test("correct passes on query", async () => {
      // GIVEN
      const db = { queryRaw: mock(async () => [{ foo: 'bar' }]) };

      // WHEN
      const result = await sql.thunk(db, "SELECT version();")();

      // THEN
      expect(result).toEqual([{ foo: 'bar' }]);
    });

    test("supports currying", async () => {
      // GIVEN
      const db = { queryRaw: mock(async () => [{ foo: 'bar' }]) };

      // WHEN
      const result = await sql.thunk(db)("SELECT version();")();

      // THEN
      expect(result).toEqual([{ foo: 'bar' }]);
    });
  });

  describe("call", () => {
    test("correctly passes on query", async () => {
      // GIVEN
      const db = { queryRaw: mock(async () => [{ result: { foo: 'bar' } }]) };

      // WHEN
      const result = await sql.call(db, "fn", { a: 1 });

      // THEN
      expect(result).toEqual({ foo: 'bar' });
      expect(db.queryRaw).toHaveBeenCalled();
      expect(db.queryRaw.mock.lastCall).toMatchInlineSnapshot(`
        [
          "SELECT fn($1) AS result;",
          [
            {
              "a": 1,
            },
          ],
        ]
      `);
    });

    test("supports currying", async () => {
      // GIVEN
      const db = { queryRaw: mock(async () => [{ result: { foo: 'bar' } }]) };

      // WHEN
      const result = await sql.call(db)("fn")({ a: 1 });

      // THEN
      expect(result).toEqual({ foo: 'bar' });
    });
  });
});
