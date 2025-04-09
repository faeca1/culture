import { _ } from '@faeca1/plug';

export default { get, post };
export { get, post };


async function get(opts) {
  const url = `${opts.baseUrl}${opts.path}`;
  const resp = await fetch(url, { headers: opts.headers });
  const body = resp.ok ? await resp.json() : await resp.text();

  return _.produce({ req: opts }, x => {
    x.timestamp = Date.now();
    x.req.method = "GET";
    x.req.url = url;
    if (x.req.headers?.["Authorization"]) {
      x.req.headers["Authorization"] = "<HIDDEN>";
    }
    x.res = {
      ok: resp.ok,
      status: resp.status,
      headers: resp.headers,
      body,
    };
  });
}


async function post(opts) {
  const { baseUrl, path, headers } = opts;
  const url = `${baseUrl}${path}`;
  const body = JSON.stringify(opts.body || opts.params);
  const method = "POST";
  const options = { body, headers, method };
  const resp = await fetch(url, options);
  const respBody = resp.ok ? await resp.json() : await resp.text();

  return _.produce({ req: opts }, x => {
    x.timestamp = Date.now();
    x.req.method = method;
    x.req.url = url;
    if (x.req.headers?.["Authorization"]) {
      x.req.headers["Authorization"] = "<HIDDEN>";
    }
    x.res = {
      ok: resp.ok,
      status: resp.status,
      headers: resp.headers,
      body: respBody
    };
  });
}
