import _clock from "./clock.js";
import _fetch, * as F from "./fetch.js";
import { child } from "./log.js";
import * as U from "./utils.js";
import pkg from "../package.json";
import { _, immer as I } from "@faeca1/plug";

http.http = http;
http.get = get;
http.post = post;
http.authHeader = authHeader;
http.jsonApiHeaders = jsonApiHeaders;

const FORM_DATA = "application/x-www-form-urlencoded";
const DEFAULT_CONTENT_TYPE = "application/json; charset=UTF-8";

export default function http(deps) {
  return U.bindValues(dependencies(deps), { get, post });
}

export function get(deps, req) {
  if (!req) {
    req = deps;
    deps = dependencies();
  } else {
    deps = dependencies(deps);
  }

  if (_.isString(req)) req = { url: req };

  const options = I.produce(req, x => {
    x.method = "GET";
  });

  return impl(deps, options);
}

export function post(deps, req) {
  if (!req) {
    req = deps;
    deps = dependencies();
  } else {
    deps = dependencies(deps);
  }

  if (_.isString(req)) req = { url: req };

  const options = I.produce(req, x => {
    x.method = "POST";
  });

  return impl(deps, options);
}

// IMPURE

async function impl({ clock, config, logger, fetch }, opts) {
  // keep original unencoded body for payload
  const body = opts.body;

  const options = buildOptions(config, opts);
  const timestamp = clock.now();
  const start = clock.performanceNow();

  try {
    const res = await fetch(options.url, options);
    const duration = clock.sinceMillis(start);
    const data = buildDataObj({ timestamp, duration, res, options, body });

    logger?.debug({ data }, "http request successful");

    return (options.details ?? !data.detailed) ? data : data.res;
  } catch (ex) {
    const duration = clock.sinceMillis(start);
    const data = buildDataObj({ timestamp, duration, options, body });
    const context = I.produce(data, x => {
      const { message, code, stack } = ex;
      x.error = { message, code, stack };
    });

    logger?.error(context, "http request errored");

    throw ex;
  }
}

// HELPERS

function authHeader(opts = {}) {
  if (opts.token) {
    return `Bearer ${opts.token}`;
  } else if (opts.key && opts.secret) {
    const authStr = Buffer.from(`${key}:${secret}`).toString("base64");
    return `Basic ${authStr}`;
  } else if (opts.username && opts.password) {
    const authStr = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${authStr}`;
  } else {
    return null;
  }
}

function buildBaseObj(opts, timings) {
  const extras = _.pick(["source", "type", "params"])(opts);
  return { ...extras, ...timings, detailed: true };
}

function buildFinalObj(base, others) {
  return I.produce(base, x => {
    if (others.req) x.req = others.req;
    if (others.res) x.res = others.res;
    if (others.error) x.error = others.error;
  });
}

function buildBody(req) {
  return hasFormData(req) ? buildFormBody(req) : buildJsonBody(req);
}

function buildDataObj({ res, timestamp, duration, options, body }) {
  const req = buildReqObj(options, body);
  const base = buildBaseObj(options, { timestamp, duration });
  const data = buildFinalObj(base, { req, res });
  return data;
}

function buildFormBody(req) {
  return new URLSearchParams(Object.entries(req.body ?? req.params));
}

function buildJsonBody(req) {
  return JSON.stringify(req.body ?? req.params);
}

function buildOptions(config, opts) {
  return I.produce(opts, x => {
    if (config.baseUrl) x.baseUrl ??= config.baseUrl;
    if (config.details) x.details ??= config.details;
    if (config.source) x.source ??= config.source;

    x.headers ??= {};
    if (config.headers) x.headers = { ...config.headers, ...x.headers };
    x.headers["User-Agent"] ??= defaultUserAgent(config);
    const Authorization = authHeader(config);
    if (Authorization) x.headers.Authorization ??= Authorization;

    if (isPostRequest(x)) {
      x.method = "POST";
      x.headers["Content-Type"] ??= DEFAULT_CONTENT_TYPE;
      x.body = buildBody(x);
    }

    x.url = buildUrl(x);
  });
}

function buildReqObj(opts, body) {
  const req = _.pick(["baseUrl", "headers", "method", "path", "url"])(opts);
  return I.produce(req, x => {
    x.method ??= "GET";
    if (body) x.body = body;
    if (x.headers?.Authorization) {
      x.headers.Authorization = "<HIDDEN>";
    }
  });
}

function buildUrl(opts) {
  return opts.baseUrl ? `${opts.baseUrl}${opts.url || opts.path}` : opts.url;
}

function defaultUserAgent(opts) {
  return opts.userAgent ?? `@faeca1/std:${pkg.version}`;
}

function dependencies(opts) {
  const logger = child(opts?.logger, "http");
  const defaults = { clock: _clock(), config: {}, fetch: _fetch() };
  return { ...defaults, ...opts, logger };
}

function hasFormData(req) {
  return req.headers?.["Content-Type"]?.includes(FORM_DATA);
}

function isPostRequest(req) {
  return req?.method?.toUpperCase() === "POST";
}

export function jsonApiHeaders(opts = {}) {
  const headers = { "Content-Type": "application/json" };

  const Authorization = authHeader(opts);
  if (Authorization) headers.Authorization = Authorization;

  return headers;
}
