const _ = require("@faeca1/matter").default;
const packages = { apiSchemaBuilder: require("api-schema-builder") };
const docs = require("./spec");
const definition = require("./definition");

module.exports = { system, handlers, getPersons, getPersonById };

function system() {
  const factory = _.mm.fromMulti(
    _.mm.method("docs", () => docs),
    _.mm.method("handlers", handlers),
  )(_.system.factory);

  return _.system(definition, { factory, packages });
}

function handlers() {
  return _.web.handlers({ getPersons, getPersonById });
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
