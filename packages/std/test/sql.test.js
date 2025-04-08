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

  describe("db", () => {
    test("correctly passes on query", async () => {
      // GIVEN
      const postgres = {
        queryRaw: mock(async () => [{ foo: 'bar' }])
      };
      const db = sql.db({ postgres });

      // WHEN
      const result = await db.query("SELECT $a", { a: 1 });

      // THEN
      expect(result).toEqual([{ foo: 'bar' }]);
      expect(postgres.queryRaw).toHaveBeenCalled();
      expect(postgres.queryRaw.mock.lastCall).toMatchInlineSnapshot(`
        [
          "SELECT $a",
          {
            "a": 1,
          },
        ]
      `);
    });
  });

  test("correctly passes on call", async () => {
    // GIVEN
    const postgres = { queryRaw: mock(async () => [{ result: { foo: 'bar' } }]) };
    const db = sql.db({ postgres });

    // WHEN
    const result = await db.call("fn", { a: 1 });

    // THEN
    expect(result).toEqual({ foo: 'bar' });
    expect(postgres.queryRaw).toHaveBeenCalled();
    expect(postgres.queryRaw.mock.lastCall).toMatchInlineSnapshot(`
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
});
