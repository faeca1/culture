import * as core from "@faeca1/plug";
import asyncIterables from "./async-iterables.js";
import clock from "./clock.js";
import collections from "./collections/index.js";
import csp from "./csp.js";
import Fetch from "./fetch.js";
import files from "./files.js";
import http from "./http.js";
import * as log from "./log.js";
import * as predicates from "./predicates.js";
import sql from "./sql.js";
import * as tasks from "./tasks.js";
import * as U from "./utils.js";
import web from "./web.js";

const commander = core.commander;
const debug = core.debug;
const mm = core.multimethod;

const _ = core._;
_.arrayify = U.arrayify;
_.asyncIterables = asyncIterables;
_.bindValues = _.curry(U.bindValues);
_.clock = clock;
_.collections = collections;
_.componentize = U.componentize;
_.csp = csp;
_.debug = debug;
_.fetch = Fetch;
_.files = files;
_.freeze = core.immer.freeze;
_.http = http;
_.log = log;
_.mm = mm;
_.packages = core;
_.partialValues = _.curry(U.bindValues);
_.peek = U.peek;
_.pkgs = core;
_.predicates = predicates;
_.produce = core.immer.produce;
_.pthen = _.curry(U.andThen);
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
