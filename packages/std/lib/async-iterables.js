export const map = afn => aseq => ({
  async *[Symbol.asyncIterator]() {
    for await (const v of aseq) { yield afn(v); }
  }
});

export const filter = afn => aseq => ({
  async *[Symbol.asyncIterator]() {
    for await (const v of aseq) { if (await afn(v)) yield v; }
  }
});

export const reject = afn => aseq => ({
  async *[Symbol.asyncIterator]() {
    for await (const v of aseq) { if (!(await afn(v))) yield v; }
  }
});

export const take = n => aseq => ({
  async *[Symbol.asyncIterator]() {
    let soFar = 0;
    for await (const v of aseq) { if (soFar++ < n) { yield v; } else { return; } }
  }
});

export const forEach = afn => async aseq => {
  for await (const v of aseq) { await afn(v); }
};

export const toArray = async aseq => {
  const vs = [];
  for await (const v of aseq) { vs.push(v); }
  return vs;
};

export const pipe = (...args) => (aiterable) => {
  let i = -1;
  const n = args.length;
  let acc = aiterable;
  while (++i < n) {
    acc = args[i](acc);
  }
  return acc;
};


export class ASeq {
  #_source;

  constructor(source) {
    this.#_source = source;
  }

  async *[Symbol.asyncIterator]() {
    for await (const v of this.#_source) yield v;
  }

  static from(source) {
    return new ASeq(source);
  }

  static range(from, count) {
    return ASeq.from(range(from, count));
  }

  filter(afn) { return ASeq.from(filter(afn)(this)); }
  reject(afn) { return ASeq.from(reject(afn)(this)); }
  map(afn) { return ASeq.from(map(afn)(this)); }
  take(afn) { return ASeq.from(take(afn)(this)); }
  forEach(afn) { return forEach(afn)(this); }
  toArray() { return toArray(this); }
  pipe(...tfms) { return pipe(...tfms)(this); }
  apply(tfm) { return tfm(this); }
}


export function from(iterable) {
  return new ASeq(iterable);
}


export function range(from, count) {
  return _toIterable(async function*() {
    while (count-- > 0) { yield from++; }
  });
}


function _toIterable(iterator) {
  return { [Symbol.asyncIterator]: iterator };
}

export default from;
from.filter = filter;
from.forEach = forEach;
from.from = from;
from.map = map;
from.pipe = pipe;
from.range = range;
from.reject = reject;
from.take = take;
from.toArray = toArray;

