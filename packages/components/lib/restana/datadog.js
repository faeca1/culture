import { optional } from "../utils.js";
const methods = [
  "get",
  "delete",
  "patch",
  "post",
  "put",
  "head",
  "options",
  "trace",
  "all",
];

export default component;

function component(opts = {}) {
  const agent = opts.dd || apm();

  return { start };

  function start({ app }) {
    if (!agent) return;
    methods.forEach(method => {
      const ref = app[method];

      app[method] = (path, ...args) => {
        args.unshift((req, __, next) => {
          try {
            const name = `${req.method} ${path}`;
            agent?.scope().active()?.setTag("resource.name", name);
            return next();
          } catch (e) {
            return next(e);
          }
        });

        return ref(path, args);
      };
    });
  }
}

function apm() {
  const pkg = optional("dd-trace");
  return pkg ? pkg.init({}).use("http") : null;
}
