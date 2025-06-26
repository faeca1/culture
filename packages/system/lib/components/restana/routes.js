export default function component() {
  return {
    start({ app, auth, config, docs, handlers }) {
      if (auth) {
        app.use(auth.authenticate());
      }

      for (const [path, methods] of Object.entries(docs.paths)) {
        for (const [method, endpoint] of Object.entries(methods)) {
          const handler = handlers[endpoint.operationId];
          if (handler) {
            const normalizedPath = path.replace(/{(\w+)}/g, ':$1');
            if (auth) {
              const scopes = securityScopes(config.roles, endpoint.security);
              app[method](normalizedPath, auth.authorize(scopes), handler);
            } else {
              app[method](normalizedPath, handler);
            }
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

