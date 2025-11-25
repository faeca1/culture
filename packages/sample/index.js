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
    logger: { level: "debug", name: "pizza" },
  };

  const core = {
    http: _.system.toDefinitions({
      auth: ["auth", ["config", "app"], "reqLogger"],
      app: ["restana.app", ["config", "logger"]],
      datadog: ["restana.datadog", "app"],
      docs,
      reqLogger: ["restana.logger", ["app", "logger"]],
      routes: [
        "restana.routes",
        ["app", "auth", "config", "docs", "handlers"],
        ["datadog", "swagger"],
      ],
      server: ["restana.server", ["app", "logger", "config"], "routes"],
      swagger: ["restana.swagger", ["app", "docs", "config"], "auth"],
    }),
    logger: ["bole", "config"],
  };

  const handlers = _.web.handlers({ getPersons, getPersonById });

  return { config, ...core, handlers };
}
