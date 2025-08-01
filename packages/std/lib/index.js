import * as core from "@faeca1/plug";
import asyncIterables from "./async-iterables.js";
import collections from "./collections/index.js";
import csp from "./csp.js";
import Fetch from "./fetch.js";
import files from "./files.js"
import * as log from "./log.js";
import * as predicates from "./predicates.js";
import sql from "./sql.js";
import * as tasks from "./tasks.js";
import web from "./web.js";

const commander = core.commander;
const debug = core.debug;
const mm = core.multimethod;

const _ = core._;
_.arrayify = (x) => Array.isArray(x) ? x : [x];
_.asyncIterables = asyncIterables;
_.bindValues = _.curry(bindValues);
_.collections = collections;
_.csp = csp;
_.debug = debug;
_.fetch = Fetch;
_.files = files;
_.freeze = core.immer.freeze;
_.log = log;
_.mm = mm;
_.packages = core;
_.partialValues = _.curry(bindValues);
_.peek = (x) => { console.log(x); return x; };
_.pkgs = core;
_.predicates = predicates;
_.produce = core.immer.produce;
_.pthen = (fn) => (p) => p.then(fn);
_.sql = sql;
_.tasks = tasks;
_.web = web;

export default _;
export {
  asyncIterables,
  commander,
  core as pkgs,
  core as packages,
  csp,
  files,
  predicates,
  tasks,
};


function bindValues(deps, obj) {
  return _.mapValues(f => _.partial(f, [deps]))(obj);
}
