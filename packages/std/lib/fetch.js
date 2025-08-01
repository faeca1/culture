import { performance } from "node:perf_hooks";
import { _ } from '@faeca1/plug';

Fetch.get = get;
Fetch.post = post;

export default Fetch;
export { get, post };


async function Fetch(url, opts = {}) {
  if (typeof url === 'object') opts = url;

  return opts.method?.toUpperCase() === "POST"
    ? post(url, opts)
    : get(url, opts);
}


async function get(url, opts = {}) {
  let options = (typeof url === 'object') ? url : _.produce(opts, x => { x.url = url; });
  options = _.produce(options, x => {
    x.method = "GET";
  });

  return _impl(options);
}


async function post(url, opts) {
  let options = (typeof url === 'object') ? url : _.produce(opts, x => { x.url = url; });
  const body = options.body;
  options = _.produce(options, x => {
    x.method = "POST";
    x.headers ??= {};
    x.headers["Content-Type"] ??= "application/json; charset=UTF-8";
    x.body = JSON.stringify(x.body || x.params);
  });

  const data = await _impl(options);
  return _.produce(data, x => { x.req.body = body; });
}


async function _impl(opts) {
  const url = opts.url || `${opts.baseUrl}${opts.path}`;
  const start = performance.now();
  const resp = await fetch(url, opts);

  const contentType = resp.headers.get("content-type");
  let body, bodyText;
  if (!contentType || !contentType.includes("application/json")) {
    bodyText = await resp.text();
  } else {
    body = await resp.json();
  }
  const duration = Math.round(performance.now() - start);

  return _.produce({ req: opts }, x => {
    x.timestamp = Date.now();
    x.duration = duration;
    x.req.method ??= "GET";
    x.req.url ??= url;
    if (x.req.headers?.["Authorization"]) {
      x.req.headers["Authorization"] = "<HIDDEN>";
    }
    x.res = {
      ok: resp.ok,
      status: resp.status,
      headers: resp.headers,
    };
    if (body) x.res.body = body;
    if (bodyText) x.res.bodyText = bodyText;
  });
}
