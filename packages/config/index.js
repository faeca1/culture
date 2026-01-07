import _ from "@faeca1/std";
import loaders from "./lib/loaders/index.js";
import processors from "./lib/processors/index.js";
import configurator from "./lib/configurator.js";

component.of = of;
component.configurator = configurator;
component.loaders = loaders;
component.processors = processors;
export default component;
export { of, configurator, loaders, processors };

function create(path = {}, opts = {}) {
  const defaults = {
    path: process.env.CONFIGURATOR__PATH,
    prefix: process.env.CONFIGURATOR__PREFIX,
    filter: new RegExp(`^${process.env.CONFIGURATOR__PREFIX || ".*"}`),
    url: process.env.CONFIGURATOR__URL,
  };

  const m = configurator();
  let options;

  if (typeof path === "object") {
    // configuration object passed as first argument;
    m.add(() => path);
    options = _.mergeAll([defaults, opts]);
  } else {
    options = _.mergeAll([defaults, opts, { path }]);
  }

  if (options.path) {
    m.add(loaders.file({ path: options.path }));
  }

  if (options.url) {
    const _processors = options.key ? [processors.mount(options)] : [];
    m.add(loaders.http(options, _processors));
  }

  if (options.prefix) {
    m.add(loaders.env([processors.envToCamelCaseProp(options)]));
  }

  return m;
}

function of(path, options) {
  return create(path, options).load();
}

function component(path, options) {
  if (path?._a43fgjdfnb54) {
    return path;
  }

  const config = create(path, options);

  const start = () => config.load();
  start._a43fgjdfnb54 = true;
  return start;
}
