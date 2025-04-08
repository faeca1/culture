import core from "@faeca1/plug";
import asyncIterables from "./async-iterables.js";
import collections from "./collections/index.js";
import csp from "./csp.js";
import * as Fetch from "./fetch.js";
import files from "./files.js"
import * as predicates from "./predicates.js";
import sql from "./sql.js";
import web from "./web.js";

const commander = core.commander;
const debug = core.debug;
const mm = core.multimethod;

const _ = core._;
_.arrayify = (x) => Array.isArray(x) ? x : [x];
_.asyncIterables = asyncIterables;
_.collections = collections;
_.csp = csp;
_.debug = debug;
_.fetch = Fetch;
_.files = files;
_.freeze = core.immer.freeze;
_.mm = mm;
_.packages = core;
_.peek = (x) => { console.log(x); return x; };
_.pkgs = core;
_.predicates = predicates;
_.produce = core.immer.produce;
_.pthen = (fn) => (p) => p.then(fn);
_.sql = sql;
_.web = web;

export default _;
export {
  asyncIterables,
  commander,
  core as pkgs,
  csp,
  files,
  predicates,
};
