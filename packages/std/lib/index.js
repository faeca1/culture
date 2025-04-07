import core from "@faeca1/plug";
import collections from "./collections/index.js";
import csp from "./csp.js";
import sql from "./sql.js";
import web from "./web.js";

const commander = core.commander;
const debug = core.debug;
const mm = core.multimethod;

const _ = core._;
_.arrayify = (x) => Array.isArray(x) ? x : [x];
_.collections = collections;
_.csp = csp;
_.debug = debug;
_.freeze = core.immer.freeze;
_.mm = mm;
_.packages = core;
_.peek = (x) => { console.log(x); return x; };
_.pkgs = core;
_.produce = core.immer.produce;
_.pthen = (fn) => (p) => p.then(fn);
_.sql = sql;
_.web = web;

export default _;
export {
  commander,
};
