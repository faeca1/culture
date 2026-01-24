import factory from "../index.js";

describe("components", () => {
  it("should produce a built-in definition referred to by name", async () => {
    const component = factory("db");
    const postgres = { queryRaw: () => 42 };
    const db = component.start({ postgres });
    const resp = await db.query("SELECT the secret;");

    expect(resp).toEqual(42);
  });
});
