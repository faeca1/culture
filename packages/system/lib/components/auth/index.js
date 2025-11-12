import jwt from "./jwt.js";

export default function component() {
  return {
    start({ app, config }) {
      const publicKey = expandNewlineLiterals(config?.jwt?.publicKey);
      const users = extractUsers(config?.basic?.allowed);
      const isExpress = isExpressApp(app);
      const auth = createAuth(publicKey, users, isExpress);
      app.use(auth.initialize());
      return auth;
    },
  };
}

function createAuth(publicKey, users, isExpress) {
  const allowed = new Map(users.map((u) => [userToBasicHeader(u), u]));

  return {
    initialize() {
      return function initializeActor(req, __, next) {
        // try Basic
        if (!req.actor) {
          req.actor = allowed.get(req.headers.authorization);
        }

        // try Bearer jwt
        if (publicKey && !req.actor) {
          try {
            const [strategy, token] =
              req.headers.authorization?.split(" ") ?? [];
            if (strategy === "Bearer") {
              req.actor = jwt.verify(token, publicKey, "ES256").body.toJSON();
            }
          } catch (e) {
            if (e.name === "JwtParseError") {
              req.actor = false;
              req.authError = { message: e.message };
            } else {
              return next(e);
            }
          }
        }

        return next();
      };
    },
    authenticate() {
      return isExpress ? authenticateExpress : authenticateRestana;
    },
    authorize(role) {
      return function authorizer(req, __, next) {
        if (!req.actor || req.actor.roles === undefined) {
          throw new Error("Missing actor role information on request object");
        }

        if (!role) {
          role = 0;
        }
        if (!Array.isArray(role)) {
          role = [role];
        }
        if (role.length === 0) {
          return next();
        }
        for (let i = 0; i < role.length; i++) {
          if (hasRole(role[i], req.actor.roles)) {
            return next();
          }
        }

        const e = new Error("Forbidden");
        e.status = e.statusCode = 403;
        e.name = "ForbiddenError";
        e.message = "Forbidden";
        return next(e);
      };
    },
  };
}

function authenticateExpress(req, res, next) {
  if (req.actor) {
    const { actorId, teamId, roles, username, email } = req.actor;
    const auth = { actorId, teamId, roles, username, email };
    req.auth = auth;
    if (req.log) {
      res.log = req.log = req.log.child({ auth });
    }
    return next();
  } else {
    res
      .set("WWW-Authenticate", 'Basic realm="401"')
      .status(401)
      .send("Authentication required.");
  }
}

function authenticateRestana(req, res, next) {
  if (req.actor) {
    const { actorId, teamId, roles, username, email } = req.actor;
    const auth = { actorId, teamId, roles, username, email };
    req.auth = auth;
    if (req.log) {
      res.log = req.log = req.log.child({ auth });
    }
    return next();
  } else {
    const headers = { "WWW-Authenticate": 'Basic realm="401"' };
    res.send("Authentication required.", 401, headers);
  }
}

function expandNewlineLiterals(str) {
  return !str ? str : str.replace(/\\n/g, "\n");
}

function extractUsers(s) {
  if (!s) return [];
  try {
    return JSON.parse(Buffer.from(s, "base64").toString());
  } catch {
    return s
      .split(";")
      .map((w) => w.split(":"))
      .map(([username, password, roles]) => ({
        username,
        password,
        roles: Number.parseInt(roles),
      }));
  }
}

function hasRole(role, user) {
  if (!(role > -1)) return false;

  if (!user) return false;

  const roles = typeof user === "number" ? user : user.roles;

  // do the roles contain the relevant bitshifted power of two
  return !!(roles & (1 << role));
}

function isExpressApp(router) {
  return (
    isExpressRouter(router) &&
    isFunction(router.get) &&
    isFunction(router.set) &&
    isFunction(router.enabled) &&
    isFunction(router.disabled)
  );
}

function isExpressRouter(router) {
  return isFunction(router) && isFunction(router.param);
}

function isFunction(value) {
  return typeof value === "function";
}

function userToBasicHeader(user) {
  const b64 = Buffer.from(`${user.username}:${user.password}`).toString(
    "base64",
  );
  return `Basic ${b64}`;
}
