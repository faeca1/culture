import core from "@faeca1/plug";
const _ = core._;
const E = core.httpErrors;

export default {
  bindr: _.curry(bindDependencies),
  check: { wasFound, wasSuccessful },
  errors: E,
  handlr: handlr,
  handlrr: handlrr,
  paginate: _.curry(toPagination),
  request: {
    arrayifyBody,
    arrayifyQuery,
    init,
    flatten,
    paging
  },
  response: {
    ok,
    created,
    noContent,
    badRequest,
    notFound,
    isResponse,
    header: _.curry(header)
  },
};


function arrayifyBody(obj) {
  return {
    ...obj,
    body: { ..._.mapValues(arrayify)(obj.body) }
  }
}


function arrayifyQuery(obj) {
  return {
    ...obj,
    query: {
      ..._.mapValues(arrayify)(obj.query),
      limit: obj.query.limit,
      offset: obj.query.offset,
      q: obj.query.q
    }
  };
}


function init(req) {
  return {
    auth: extractAuth(req),
    body: req.body,
    params: req.params,
    query: req.query,
  };
}


function paging(obj) {
  return {
    ...obj,
    query: {
      ...obj.query,
      limit: Math.max(0, Math.min(obj.query.limit || 20, 100)),
      offset: Math.max(0, obj.query.offset || 0)
    }
  };
}


function ok(body) {
  return { status: 200, headers: {}, body };
}


function created(body) {
  return { status: 201, headers: {}, body };
}


function noContent() {
  return { status: 204, headers: {} };
}


function badRequest(body) {
  return { status: 400, headers: {}, body };
}


function notFound(body) {
  return { status: 404, headers: {}, body };
}


function header(name, value, resp) {
  const r = { ...resp };
  if (!r.headers) r.headers = {};
  r.headers[name] = value;
  return r;
}


function isResponse(obj) {
  return obj?.status && obj?.headers;
}


function wasFound(x) {
  if (_.isNil(x)) throw new E(404, "No matching item found");
  return x;
}


function wasSuccessful(x) {
  if (_.isNil(x)) throw new E(500, "wasSuccessful called with nil result");
  if (!x.error && x.success !== false) return x;

  const { status = 500, message = "Unknown error", code, name } = x.error || {};
  throw new E(status, message, { code, name });
}


function bindDependencies(deps, obj) {
  return _.mapValues(f => _.partial(f, [deps]))(obj);
}


function flatten(req) {
  if (!req.params || !req.query) { return req; }

  const { auth, body, params, query } = req;
  return { auth, ...body, ...params, ...query };
}


function toPagination(req, data) {
  const { offset, limit } = flatten(req || {});
  return { data: data || [], pagination: { offset, limit, count: data?.length || 0 } };
}


function extractAuth(req) {
  if (!req || !req.actor) return void 0;
  const { actorId, teamId, email, username, roles } = req.actor;
  return { actorId, teamId, email, username, roles };
}


function arrayify(item) {
  return Array.isArray(item) ? item : [item];
}


function handlr(fn) {
  return async function handleMiddleware(req, res, next) {
    try {
      let resp = await fn(req);
      if (_.isUndefined(resp)) { resp = noContent(); }
      if (_.isNull(resp)) { resp = notFound(); }
      if (!isResponse(resp)) { resp = ok(resp); }

      // resp is now in standard form;

      const { status, headers, body = null } = resp;
      return res.send(body, status, headers);
    } catch (e) {
      next(e);
    }
  }
}


function handlrr(fn) {
  return handlr(req => fn(init(req)));
}
