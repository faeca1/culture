import { optional } from "../utils.js";
const methods = ['get', 'delete', 'patch', 'post', 'put', 'head', 'options', 'trace', 'all'];

export default component;


function component(opts = {}) {
  const agent = opts.dd || apm();

  return { start };

  function start({ app }) {
    if (!agent) return;
    methods.forEach(method => {
      const ref = app[method];

      app[method] = (path, ...args) => {
        args.unshift(agent.wrap("web.request", async (req, __, next) => {
          try {
            agent?.scope?.().active().setTag("resource.name", `${req.method} ${path}`);
            return await next();
          } catch (e) {
            return await next(e);
          }
        }));

        return ref(path, args);
      };
    });
  }
}


function apm() {
  const pkg = optional("dd-trace");
  return pkg ? pkg.init({}).use("http") : null;
}
