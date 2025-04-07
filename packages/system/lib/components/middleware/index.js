import defaults from "./config.js";
import rateLimit from "./rate-limit/index.js";

component.rateLimiter = rateLimiter;
export default component;
export { rateLimiter };


function component() {
  function start({ app, config = {} }) {
    const limiter = rateLimiter(config);
    if (!limiter) return;
    app.use(limiter);
  }

  return { start }
}


function rateLimiter(opts = {}) {
  const cfg = buildConfig(defaults, opts);
  const include = shouldInclude(defaults, opts);
  return include('rateLimit') ? rateLimit(cfg('rateLimit')) : null;
}


function buildConfig(defaults, opts) {
  const include = shouldInclude(defaults, opts)

  return function middlewareConfig(name) {
    return include(name) ? { ...defaults[name], ...opts[name] } : false
  }
}


function shouldInclude(defaults, opts) {
  return function includeMiddleware(name) {
    if (opts[name] === false) return false
    if (opts[name] === undefined && defaults[name] === false) return false
    return true
  }
}
