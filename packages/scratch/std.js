import _ from "@faeca1/std";

const list = ["olives", "anchovies", "capers"];
const isVowel = x => "aeiou".includes(x);
const result =
  _.pipe(
    _.filter(x => isVowel(x[0])),
    _.map(x => x.toUpperCase()),
    _.drop(1),
    _.first
  )(list);
console.log(result); // prints "ANCHOVIES"


const double = (x) => 2 * x;

const fn = _.collections.cache(x => x, double);

async function main() {
  console.log(await fn(1));
  console.log(await fn(2));
  console.log(await fn(1));
  console.log(await fn(2));
  console.log(await fn(3));
  console.log(await Promise.all(_.pipe(_.map(double), _.map(x => x + 1), _.map(fn))([1, 2, 3, 4])));
  // console.log((await _.fetch("https://www.google.com/").then(r => r.text())));
  // console.log((await _.fetch("https://www.bbc.com/robots.txt").then(r => r.text())));
}

main();

function checks() {

  const store = _.collections.siphonableBoundedCacheMap();
  console.log(store.add(1, { pizza: true }));
  console.log(store.add(1, { pasta: true }));
  console.log(store.drain(1));

  _.web.check.wasFound({})
  _.web.check.wasFound([])
  _.web.check.wasFound("")
  _.web.check.wasFound(0)
  // _.web.check.wasFound(null)
  // _.web.check.wasFound(undefined)

  _.web.check.wasSuccessful({ success: true })
  _.web.check.wasSuccessful({ a: "b" })
  _.web.check.wasSuccessful([])
  _.web.check.wasSuccessful("b")
  _.web.check.wasSuccessful(0)
  // _.web.check.wasSuccessful({ success: false })
  // _.web.check.wasSuccessful({ success: null })
  // _.web.check.wasSuccessful({ error: { status: 422 }, success: false })
  // _.web.check.wasSuccessful({ error: { status: 422 } })
  // _.web.check.wasSuccessful({ success: undefined })

  console.log(_.web.paginate(undefined)(undefined))
  console.log(_.web.paginate(null)(undefined))
  console.log(_.web.paginate(undefined)(null))
  console.log(_.web.paginate(null)(null))
  console.log(_.web.paginate({})(null))
  console.log(_.web.paginate({})(undefined))
  console.log(_.web.paginate(undefined)({}))
  console.log(_.web.paginate(null)({}))
  console.log(_.web.paginate(undefined)([]))
  console.log(_.web.paginate(null)([]))
  console.log(_.web.paginate({ offset: 0 })([]))
  console.log(_.web.paginate({ offset: 0, limit: null })([]))
  console.log(_.web.paginate({ offset: 0, limit: 10 })([]))
  console.log(_.web.paginate({ offset: 0, limit: 10 })([{ a: 1 }]))

  console.log(_.web.request.init({}).auth)
  console.log(_.web.request.init({ actor: {} }).auth)
  console.log(_.web.request.init({ actor: { actorId: 1 } }).auth)
  console.log(_.web.request.init({ actor: { actorId: 1, foo: 'pizza' } }).auth)
  console.log(_.web.request.init({ actor: { actorId: 1, foo: 'pizza', teamId: "blah" } }).auth)
}

checks();


