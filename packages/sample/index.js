const _ = require("@faeca1/matter").default;
const apiSchemaBuilder = require("api-schema-builder");
const docs = require("./spec");


function handlers() {
  return _.mapValues(_.web.handlrr)({
    getPersonById(req) {
      const id = req.params.id;
      const person = { id, name: "pizza", age: 10 };
      return _.web.response.ok(person);
    }
  });
}


function _C([init, dependsOn, comesAfter]) {
  return { init, dependsOn, comesAfter };
}


const definition = {
  config: {
    http: {
      auth: { basic: { allowed: 'user:ssshhh:3' } },
      routes: { roles: { ping: 0, read: 1 } },
      swagger: { buildResponses: false },
    },
    logger: { level: "debug", name: "pizza" },
  },
  docs,
  http: {
    auth: _C(['auth', ['config', 'app'], 'reqLogger']),
    app: _C(['restana.app', ['config', 'logger']]),
    datadog: _C(['restana.datadog', 'app']),
    handlers,
    reqLogger: _C(['restana.logger', ['app', 'logger']]),
    routes: _C(['restana.routes', ['app', 'auth', 'config', 'docs', 'handlers'], ['datadog', 'swagger']]),
    server: _C(['restana.server', ['app', 'logger', 'config'], 'routes']),
    swagger: _C(['restana.swagger', ['app', 'docs', 'config'], 'auth']),
  },
  logger: ['bole', 'config'],
};

const system = _.system(definition, { packages: { apiSchemaBuilder } });
_.system.runner(system)
  .start()
  .then(s => s.logger.info("system started"));
