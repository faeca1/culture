import _fetch, * as F from "./fetch.js";
import { child } from "./log.js";
import * as U from "./utils.js";
import pkg from "../package.json";
import { immer as I } from "@faeca1/plug";

http.authHeader = authHeader;
http.create = create;
http.jsonApiHeaders = jsonApiHeaders;

export default function http(opts) {
  const Fetch = opts?.fetch;

  return { start };

  function start(deps) {
    return create({ ...deps, Fetch });
  }
}

export function create(deps) {
  const config = I.produce(deps?.config || {}, (x) => {
    x.headers ??= {};
    x.headers["User-Agent"] ??= defaultUserAgent(x);
    const Authorization = authHeader(x);
    if (Authorization) x.header.Authorization ??= Authorization;
  });
  const logger = child(deps?.logger, "http");
  const Fetch = deps?.Fetch || _fetch;
  const fns = { get, post };
  return U.bindValues({ config, logger, Fetch }, fns);
}

export function get(deps, req) {
  if (typeof req === "string") req = { url: req };
  const options = I.produce(req, (x) => {
    x.method = "GET";
  });
  return impl(deps, options);
}

export function post(deps, req) {
  const options = I.produce(req, (x) => {
    x.method = "POST";
  });
  return impl(deps, options);
}

export async function impl({ config, logger, Fetch }, opts) {
  const options = buildOptions(config, opts);
  const url = options.url;

  try {
    const data = await Fetch(url, options);
    logger?.debug({ data }, "http request successful");
    return (options.detailsWanted ?? !data.detailed) ? data : data.res;
  } catch (ex) {
    const req = F.buildReqObj(url, opts);
    const error = { message: ex.message, code: ex.code, stack: ex.stack };
    logger?.error({ req, error }, "http request errored");
    throw ex;
  }
}

// HELPERS
export function buildOptions(config, opts) {
  return I.produce(opts, (x) => {
    if (config.baseUrl) x.baseUrl ??= config.baseUrl;
    if (config.detailsWanted) x.detailsWanted ??= config.detailsWanted;
    if (config.headers) x.headers = { ...config.headers, ...x.headers };
    if (config.source) x.source ??= config.source;
    x.url = buildUrl(x);
  });
}

export function authHeader(opts = {}) {
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

function buildUrl(opts) {
  return opts.url || `${opts.baseUrl}${opts.path}`;
}

function defaultUserAgent(opts) {
  return opts.userAgent ?? `@faeca1/std:${pkg.version}`;
}

export function jsonApiHeaders(opts = {}) {
  const headers = { "Content-Type": "application/json" };

  const Authorization = authHeader(opts);
  if (Authorization) headers.Authorization = Authorization;

  return headers;
}
