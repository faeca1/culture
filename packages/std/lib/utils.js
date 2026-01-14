import { _ } from "@faeca1/plug";
import { withChildLogger } from "./log";

export function andThen(fn, p) {
  return p.then(fn);
}

export function arrayify(x) {
  return Array.isArray(x) ? x : [x];
}

export function bindValues(deps, obj) {
  return _.mapValues(f => _.partial(f, [deps]))(obj);
}

export function componentize(opts, fns) {
  if (!fns) {
    fns = opts;
    opts = {};
  }

  const name = typeof opts === "string" ? opts : (opts?.component ?? "");

  return function component(system = {}) {
    const deps = withChildLogger(system, name);
    return bindValues(deps, fns);
  };
}

export function peek(x) {
  console.log(x);
  return x;
}
