export default function http(opts, postProcessors = []) {
  return async function httpLoader() {
    if (!opts.url) {
      throw new Error("url is required");
    }
    const resp = await fetch(opts.url);
    const config = await resp.json();
    return process(config, postProcessors);
  };
}


async function process(config, processors) {
  let result = config;
  for (const p of processors) {
    result = await p(result);
  }
  return result;
}
