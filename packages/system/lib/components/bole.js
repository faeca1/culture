component.create = create;
export default component;
export { create };

const defaults = {
  level: "warn",
  name: "bole",
  stream: process.stdout,
};

let globalsSet = false;


function component(opts) {
  return {
    start(deps) {
      return create(opts, deps);
    }
  }
}


function create(opts, deps) {
  const bole = opts.bole;
  const config = { ...defaults, ...deps?.config };

  if (!globalsSet) {
    bole.setFastTime();
    bole.output(config);
    globalsSet = true;
  }
  const name = deps?.config?.name || deps?.pkg?.name || opts?.name || defaults.name;
  return wrap(bole(name), config);
}


function wrap(log, { level, globals }) {
  return {
    child: function(opts) {
      return wrap(log(opts.component), { level, globals });
    },
    debug: levelLogger(log.debug, globals),
    info: levelLogger(log.info, globals),
    warn: levelLogger(log.warn, globals),
    error: levelLogger(log.error, globals),
    level
  };
}


function levelLogger(log, globals) {
  if (!globals) return log;

  return function wrappedLevelLogger(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
    if (typeof inp === 'string' || inp == null) {
      log(globals, inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
    } else {
      if (inp instanceof Error) {
        if (typeof a2 === 'object') {
          log(inp, { ...globals, ...a2 }, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
        } else {
          log(inp, globals, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
        }
      } else {
        if (typeof inp === 'object') {
          log({ ...globals, ...inp }, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
        } else {
          log(globals, inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
        }
      }
    }
  }
}
