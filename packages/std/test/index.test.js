import _ from "../lib/index.js";

test("standard lib functions work", () => {
  const list = ["olives", "anchovies", "capers"];
  const isVowel = (x) => "aeiou".includes(x);
  const result = _.pipe(
    _.filter((x) => isVowel(x[0])),
    _.map((x) => x.toUpperCase()),
    _.drop(1),
    _.first,
  )(list);
  expect(result).toBe("ANCHOVIES");
});
