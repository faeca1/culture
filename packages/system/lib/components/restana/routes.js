export default function component() {
  return {
    start({ app, auth, config, docs, handlers }) {
      app.use(auth.authenticate());

      for (const [path, methods] of Object.entries(docs.paths)) {
        for (const [method, endpoint] of Object.entries(methods)) {
          const handler = handlers[endpoint.operationId];
          if (handler) {
            const normalizedPath = path.replace(/{(\w+)}/g, ':$1');
            const scopes = securityScopes(config.roles, endpoint.security);
            app[method](normalizedPath, auth.authorize(scopes), handler);
          }
        }
      }
    }
  };
}

function securityScopes(roles, security = []) {
  const scopes = new Set();

  security.map(s => Object.values(s))
    .flat(2)
    .map(r => roles[r])
    .forEach(e => scopes.add(e));

  return [...scopes];
}

