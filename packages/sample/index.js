const _ = require("@faeca1/matter").default;
const packages = { apiSchemaBuilder: require("api-schema-builder") };
const docs = require("./spec");

main();

async function main() {
  const system = _.system(definition(), { packages });
  const { logger } = await _.system.runner(system).start();
  logger.info("system started");
}

function getPersons() {
  const persons = [
    { id: 1, name: "pizza", age: 10 },
    { id: 2, name: "pasta", age: 10 },
  ];
  return _.web.response.ok(persons);
}

function getPersonById(__, req) {
  const id = req.params.id;
  const person = { id, name: "pizza", age: 10 };
  return _.web.response.ok(person);
}

function definition() {
  const config = {
    http: {
      auth: { basic: { allowed: "user:ssshhh:3" } },
      routes: { roles: { ping: 0, read: 1 } },
      swagger: { buildResponses: false },
    },
    logger: { level: "debug", name: "sample-app" },
  };

  const http = _.system.toDefinitions({
    auth: ["auth", "app", "reqLog"],
    app: ["app", "logger"],
    datadog: ["datadog", "app"],
    docs,
    reqLog: ["reqLog", ["app", "logger"]],
    routes: ["routes", ["app", "auth", "docs", "handlers"], ["datadog", "swagger"]],
    server: ["server", ["app", "logger"], "routes"],
    swagger: ["swagger", ["app", "docs"], "auth"],
  });

  const handlers = _.web.handlers({ getPersons, getPersonById });

  return { config, http, logger: "bole", handlers };
}
