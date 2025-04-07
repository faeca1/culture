import auth from "./auth/index.js";
import bole from "./bole.js";
import * as express from "./express/index.js";
import pg from "./pg.js";
import pino from "./pino.js";
import postgres from "./postgres.js";
import * as restana from "./restana/index.js";
import slack from "./slack.js";

export default get;
export {
  auth,
  bole,
  express,
  pg,
  pino,
  postgres,
  restana,
  slack
};


function get(name, opts) {
  const packages = opts?.packages ?? {};

  switch (name) {
    case "auth":
      return auth();
    case "bole":
      return bole(packages);
    case "express.app":
      return express.app(packages);
    case "express.errorHandler":
      return express.errorHandler();
    case "express.middleware":
      return express.middleware();
    case "express.server":
      return express.server();
    case "pg":
      return pg(packages);
    case "pino":
      return pino(packages);
    case "pino.http":
      return pino.http();
    case "postgres":
      return postgres(packages);
    case "restana.app":
      return restana.app(packages);
    case "restana.datadog":
      return restana.datadog();
    case "restana.logger":
      return restana.logger();
    case "restana.server":
      return restana.server();
    case "restana.swagger":
      return restana.swagger(packages);
    case "slack":
      return slack();
    default:
      return null;
  }
}
