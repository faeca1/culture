import web from "./web.js";

real.fake = fake;

// thin wrapper around the build-in fetch
// allows easier faking and deals with body-handling boilerplate
export default function real() {
  return async function Fetch(url, opts) {
    const resp = await fetch(url, opts);
    const body = !isJsonResponse(resp) ? await resp.text() : await resp.json();

    return {
      ok: resp.ok,
      status: resp.status,
      headers: Object.fromEntries(resp.headers.entries()),
      body,
    };
  };
}

function fake() {
  let response = web.response.ok({});

  async function fakeFetch() {
    return response;
  }

  fakeFetch.set = (resp) => {
    response = resp;
  };

  return fakeFetch;
}

function isJsonResponse(res) {
  const contentType = res.headers.get("Content-Type");
  return contentType.includes("application/json");
}
