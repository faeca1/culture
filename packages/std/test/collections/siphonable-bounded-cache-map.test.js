import Store from "../../lib/collections/siphonable-bounded-cache-map.js";

describe("siphonable-bounded-cache-map", () => {
  describe("adding", () => {
    test("should throw if called without a key", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // THEN
      expect(() => store.add(null)).toThrow();
      expect(() => store.add()).toThrow();
    });

    test("should allow falsy keys", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      const added = store.add(0, { food: "pizza" });

      // THEN
      expect(added).toBeTruthy();

      expect(store.full("one")).toBeFalsy();

      expect(store.has(0)).toBeTruthy();

      expect(store.hits(0)).toBe(1);

      expect(store.isEmpty()).toBeFalsy();

      expect(store.seen(0)).toBeTruthy();
    });

    test("should add new entry not seen before", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      const added = store.add("one", { food: "pizza" });

      // THEN
      expect(added).toBeTruthy();

      expect(store.full("one")).toBeFalsy();

      expect(store.has("one")).toBeTruthy();

      expect(store.hits("one")).toBe(1);
      expect(store.hits()).toBe(1);

      expect(store.isEmpty()).toBeFalsy();

      expect(store.seen("one")).toBeTruthy();
    });

    test("should add new entry for a seen key", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      const added1 = store.add("one", { food: "pizza" });
      const added2 = store.add("one", { food: "pasta" });

      // THEN
      expect(added1).toBeTruthy();
      expect(added2).toBeTruthy();

      expect(store.full("one")).toBeFalsy();

      expect(store.has("one")).toBeTruthy();

      expect(store.hits("one")).toBe(2);
      expect(store.hits()).toBe(2);

      expect(store.isEmpty()).toBeFalsy();

      expect(store.seen("one")).toBeTruthy();
    });

    test("should add entries for different keys", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      const added1 = store.add("one", { food: "pizza" });
      const added2 = store.add("one", { food: "pasta" });
      const added3 = store.add("two", { food: "gelato" });
      const added4 = store.add("two", { food: "risotto" });

      // THEN
      expect(added1).toBeTruthy();
      expect(added2).toBeTruthy();
      expect(added3).toBeTruthy();
      expect(added4).toBeTruthy();

      expect(store.full("one")).toBeFalsy();
      expect(store.full("two")).toBeFalsy();

      expect(store.has("one")).toBeTruthy();
      expect(store.has("two")).toBeTruthy();

      expect(store.hits("one")).toBe(2);
      expect(store.hits("two")).toBe(2);
      expect(store.hits()).toBe(4);

      expect(store.isEmpty()).toBeFalsy();

      expect(store.seen("one")).toBeTruthy();
      expect(store.seen("two")).toBeTruthy();
    });

    test("counts duplicates twice", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      const added1 = store.add("one", { food: "pizza" });
      const added2 = store.add("one", { food: "pasta" });
      const added3 = store.add("one", { food: "pasta" });

      // THEN
      expect(added1).toBeTruthy();
      expect(added2).toBeTruthy();
      expect(added3).toBeTruthy();

      expect(store.full("one")).toBeFalsy();

      expect(store.has("one")).toBeTruthy();

      expect(store.hits("one")).toBe(3);
      expect(store.hits()).toBe(3);

      expect(store.isEmpty()).toBeFalsy();

      expect(store.seen("one")).toBeTruthy();
    });

    test("shouldn't add new entry when saturated", () => {
      // GIVEN
      const store = Store({ maxHits: 1 });

      // WHEN
      const added1 = store.add("one", { food: "pizza" });
      const added2 = store.add("one", { food: "pasta" });

      // THEN
      expect(added1).toBeTruthy();
      expect(added2).toBeFalsy()

      expect(store.full("one")).toBeTruthy();

      expect(store.has("one")).toBeTruthy();

      expect(store.hits("one")).toBe(1);
      expect(store.hits()).toBe(1);

      expect(store.isEmpty()).toBeFalsy();

      expect(store.seen("one")).toBeTruthy();
    });
  });

  describe("removing", () => {
    describe("for a given key", () => {
      test("should remove and return all items for given key", () => {
        // GIVEN
        const store = Store({ maxHits: 5 });
        store.add("one", { food: "pizza" });
        store.add("one", { food: "pasta" });
        store.add("one", { food: "gelato" });
        store.add("two", { food: "risotto" });

        // WHEN
        const items = store.drain("one");

        // THEN
        expect(items.length).toBe(3);
        expect(store.has("one")).toBeFalsy();
        expect(store.isEmpty()).toBeFalsy();
      });

      test("should remove and return all items for a falsy key", () => {
        // GIVEN
        const store = Store({ maxHits: 5 });
        store.add(0, { food: "pizza" });
        store.add(0, { food: "pasta" });
        store.add(false, { food: "gelato" });
        store.add(0, { food: "risotto" });

        // WHEN
        const items = store.drain(0);

        // THEN
        expect(items.length).toBe(3);
        expect(store.has(0)).toBeFalsy();
        expect(store.isEmpty()).toBeFalsy();
      });

      test("should leave other keys untouched", () => {
        // GIVEN
        const store = Store({ maxHits: 5 });
        store.add("one", { food: "pizza" });
        store.add("one", { food: "pasta" });
        store.add("one", { food: "gelato" });
        store.add("two", { food: "risotto" });

        // WHEN
        store.drain("one");

        // THEN
        expect(store.has("two")).toBeTruthy();
        expect(store.isEmpty()).toBeFalsy();
      });

      test("should leave hit counts, fullness, and seen status, as they were", () => {
        // GIVEN
        const store = Store({ maxHits: 5 });
        store.add("one", { food: "pizza" });
        store.add("one", { food: "pasta" });
        store.add("one", { food: "gelato" });
        store.add("two", { food: "risotto" });

        const beforeOne = store.hits("one");
        const beforeTwo = store.hits("two");
        const beforeAll = store.hits();
        const fullnessOne = store.full("one");
        const fullnessTwo = store.full("two");

        // WHEN
        store.drain("one");

        // THEN
        expect(store.hits("one")).toBe(beforeOne);
        expect(store.hits("two")).toBe(beforeTwo);
        expect(store.hits()).toBe(beforeAll);
        expect(store.full("one")).toBe(fullnessOne);
        expect(store.full("two")).toBe(fullnessTwo);
        expect(store.seen("one")).toBeTruthy();
        expect(store.seen("two")).toBeTruthy();
      });
    });

    describe("for all keys", () => {
      test("should remove and return all items", () => {
        // GIVEN
        const store = Store({ maxHits: 5 });
        store.add("one", { food: "pizza" });
        store.add("one", { food: "pasta" });
        store.add("one", { food: "gelato" });
        store.add("two", { food: "risotto" });

        // WHEN
        const items = store.drain();

        // THEN
        expect(items.length).toBe(4);
        expect(store.has("one")).toBeFalsy();
        expect(store.has("two")).toBeFalsy();
        expect(store.isEmpty()).toBeTruthy();
      });

      test("should leave hit counts, fullness, and seen status, as they were", () => {
        // GIVEN
        const store = Store({ maxHits: 5 });
        store.add("one", { food: "pizza" });
        store.add("one", { food: "pasta" });
        store.add("one", { food: "gelato" });
        store.add("two", { food: "risotto" });

        const beforeOne = store.hits("one");
        const beforeTwo = store.hits("two");
        const beforeAll = store.hits();
        const fullnessOne = store.full("one");
        const fullnessTwo = store.full("two");

        // WHEN
        store.drain();

        // THEN
        expect(store.hits("one")).toBe(beforeOne);
        expect(store.hits("two")).toBe(beforeTwo);
        expect(store.hits()).toBe(beforeAll);
        expect(store.full("one")).toBe(fullnessOne);
        expect(store.full("two")).toBe(fullnessTwo);
        expect(store.seen("one")).toBeTruthy();
        expect(store.seen("two")).toBeTruthy();
      });
    });
  });

  describe("accounting", () => {
    test("a newly created store reports correctly", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // THEN
      expect(store.full("one")).toBeFalsy();
      expect(store.has("one")).toBeFalsy();
      expect(store.hits("one")).toBe(0);
      expect(store.hits()).toBe(0);
      expect(store.isEmpty()).toBeTruthy();
      expect(store.seen("one")).toBeFalsy();
    });

    test("should not claim to have seen keys it hasn't", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      store.add("one", { food: "pizza" });

      // THEN
      expect(store.seen("two")).toBeFalsy();
    });

    test("should report 0 hits for never seen keys", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      store.add("one", { food: "pizza" });

      // THEN
      expect(store.hits("two")).toBe(0);
    });

    test("should not claim to have values it doesn't", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // WHEN
      store.add("one", { food: "pizza" });

      // THEN
      expect(store.has("two")).toBeFalsy();
    });

    test("should report correctly for falsy key", () => {
      // GIVEN
      const store = Store({ maxHits: 2 });

      // WHEN
      store.add(0, { food: "pasta" });
      store.add(0, { food: "pizza" });
      store.add(false, { food: "risotto" });

      // THEN
      expect(store.full(0)).toBeTruthy();
      expect(store.full(false)).toBeFalsy();

      expect(store.has(0)).toBeTruthy();
      expect(store.has(false)).toBeTruthy();

      expect(store.hits(0)).toBe(2);
      expect(store.hits(false)).toBe(1);
      expect(store.hits()).toBe(3);

      expect(store.isEmpty()).toBeFalsy();

      expect(store.seen(0)).toBeTruthy();
      expect(store.seen(false)).toBeTruthy();
    });

    test("should throw if full called without key", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // THEN
      expect(() => store.full()).toThrow();
    });

    test("should throw if has called without key", () => {
      // GIVEN
      const store = Store({ maxHits: 5 });

      // THEN
      expect(() => store.has()).toThrow();
    });
  });
});
