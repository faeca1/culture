const _ = require("@faeca1/matter").default;
const packages = { apiSchemaBuilder: require("api-schema-builder") };
const docs = require("./spec");
const System = require("./system");

main();

async function main() {
  const handlers = _.web.handlers({ getPersons, getPersonById });
  const definition = { ...System, docs, handlers };
  const system = _.system(definition, { packages });
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
