import { performance } from "node:perf_hooks";
import { _, immer as I } from "@faeca1/plug";

const FORM_DATA = "application/x-www-form-urlencoded";
const JSON_DATA = "application/json";
const DEFAULT_CONTENT_TYPE = "application/json; charset=UTF-8";

// HTTP

export default async function Fetch(url, opts = {}) {
  // keep original unencoded body for payload
  const body = opts.body;

  const options = isPostRequest(opts) ? postOptions(opts) : opts;

  const result = await _impl(url, options);

  const req = buildReqObj(url, options);
  const res = buildResObj(result);
  const payload = buildFinalObj(req, res, result, options);

  // re-attach original unencoded body
  return I.produce(payload, (x) => {
    x.req.body = body;
  });
}

export function postOptions(opts) {
  return I.produce(opts, (x) => {
    x.method = "POST";
    x.headers ??= {};
    x.headers["Content-Type"] ??= DEFAULT_CONTENT_TYPE;
    x.body = buildBody(x);
  });
}

async function _impl(url, opts) {
  console.log(opts);
  const timestamp = Date.now();
  const start = performance.now();
  const resp = await fetch(url, opts);
  const data = !isJsonResponse(resp) ? await resp.text() : await resp.json();
  const duration = Math.round(performance.now() - start);

  return { timestamp, duration, resp, data };
}

export function buildReqObj(url, opts) {
  const req = _.pick(["baseUrl", "headers", "method", "path"])(opts);
  console.log("123");
  console.log(req);
  req.method ??= "GET";
  req.url ??= url;
  if (req.headers?.Authorization) {
    req.headers.Authorization = "<HIDDEN>";
  }
  return req;
}

export function buildResObj({ resp, data }) {
  const obj = {
    ok: resp.ok,
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
  };

  if (isJsonResponse(resp)) {
    obj.body = data;
  } else {
    obj.bodyText = data;
  }

  return obj;
}

export function buildFinalObj(req, res, obj, opts) {
  const extras = _.pick(["source", "type", "params"])(opts);
  const others = _.pick(["duration", "timestamp"])(obj);
  const x = { ...extras, ...others };
  x.req = req;
  x.res = res;
  x.detailed = true;
  return x;
}

function hasFormData(req) {
  return req.headers?.["Content-Type"]?.includes(FORM_DATA);
}

function isJsonResponse(res) {
  const contentType = res.headers.get("Content-Type");
  return contentType.includes(JSON_DATA);
}

function buildBody(req) {
  return hasFormData(req) ? buildFormBody(req) : buildJsonBody(req);
}

function buildJsonBody(req) {
  return JSON.stringify(req.body ?? req.params);
}

function buildFormBody(req) {
  return new URLSearchParams(Object.entries(req.body ?? req.params));
}

function isPostRequest(req) {
  console.log(req);
  return req?.method?.toUpperCase() === "POST";
}
