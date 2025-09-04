import { _ } from "@faeca1/plug";

export function andThen(fn, p) {
  return p.then(fn);
}

export function arrayify(x) {
  return Array.isArray(x) ? x : [x];
}

export function bindValues(deps, obj) {
  return _.mapValues((f) => _.partial(f, [deps]))(obj);
}

export function peek(x) {
  console.log(x);
  return x;
}
