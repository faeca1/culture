import _ from "@faeca1/std";

init.mount = mount;
export default init;
export { init, mount };

function init(opts) {
  return (config) => mount(opts, config);
}


function mount(options, obj) {
  if (!options.key) {
    throw new Error("key is required");
  }
  return _.set(options.key, obj)({});
}
