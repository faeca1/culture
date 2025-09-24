import _ from "@faeca1/std";

configurator.add = add;
configurator.init = init;
configurator.load = load;
export default configurator;
export { add, init, load };

// state = { factories: [], options: { } };

function init(options) {
  return _.produce({ factories: [] }, (it) => {
    it.options = options;
  });
}

function add(configurator, factory) {
  return _.produce(configurator, (it) => {
    it.factories.push(factory);
  });
}

async function load(configurator) {
  const configs = await Promise.all(configurator.factories.map((f) => f()));
  const result = _.mergeAll(configs);
  return _.freeze(result, true);
}

function configurator() {
  let state = init();

  return {
    add(factory) {
      state = add(state, factory);
    },
    load() {
      return load(state);
    },
  };
}
