const _ = require("@faeca1/matter").default;
const apiSchemaBuilder = require("api-schema-builder");
const docs = require("./spec");


function handler(__) {
  return _.web.response.ok({ msg: "Hello!" });
}


function routes({ app, auth }) {
  app.get("/persons/:id",
    auth.authenticate(),
    auth.authorize(0),
    _.web.handlrr(handler))
}


function _C([init, dependsOn, comesAfter]) {
  return { init, dependsOn, comesAfter };
}


const definition = {
  config: {
    http: {
      auth: { basic: { allowed: 'user:ssshhh:3' } },
      swagger: { buildResponses: false },
    },
    logger: { level: "debug", name: "pizza" },
  },
  docs,
  http: {
    auth: _C(['auth', ['config', 'app'], 'reqLogger']),
    reqLogger: _C(['restana.logger', ['app', 'logger']]),
    app: _C(['restana.app', ['config', 'logger']]),
    datadog: _C(['restana.datadog', 'app']),
    server: _C(['restana.server', ['app', 'logger', 'config'], 'routes']),
    swagger: _C(['restana.swagger', ['app', 'docs', 'config'], 'auth']),
    routes: _C([routes, ['app', 'auth'], ['datadog', 'swagger']]),
  }, logger: ['bole', 'config'],
};

const system = _.system(definition, { packages: { apiSchemaBuilder } });
_.system.runner(system)
  .start()
  .then(s => s.logger.info("system started"));
