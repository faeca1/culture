import _ from "@faeca1/std";
import auth from "./auth/index.js";
import bole from "./bole.js";
import boss from "./boss.js";
import db from "./db.js";
import duck from "./duck.js";
import google from "./google.js";
import postgres from "./postgres.js";
import * as restana from "./restana/index.js";
import slack from "./slack.js";

export default _.mm.multi(
  (component, packages) => component,
  _.mm.method(c => c),
  _.mm.method("auth", () => auth()),
  _.mm.method("logger", (__, ps) => bole(ps)),
  _.mm.method("boss", (__, ps) => boss(ps)),
  _.mm.method("db", () => db()),
  _.mm.method("duck", (__, ps) => duck(ps)),
  _.mm.method("google.auth", (__, ps) => google.auth(ps)),
  _.mm.method("google.sheets", (__, ps) => google.sheets(ps)),
  _.mm.method("postgres", (__, ps) => postgres(ps)),
  _.mm.method("app", (__, ps) => restana.app(ps)),
  _.mm.method("datadog", () => restana.datadog()),
  _.mm.method("reqLog", () => restana.logger()),
  _.mm.method("routes", () => restana.routes()),
  _.mm.method("server", () => restana.server()),
  _.mm.method("swagger", (__, ps) => restana.swagger(ps)),
  _.mm.method("slack", () => slack()),
);
