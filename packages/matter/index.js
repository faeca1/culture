import factory from "@faeca1/components";
import config from "@faeca1/config";
import std from "@faeca1/std";
import System from "@faeca1/system";
const pkgs = std.packages;

std.config = config;
std.system = system;
std.system.factory = factory;
Object.keys(System).forEach(k => {
  std.system[k] = System[k];
});

export default std;
export { config, std as _, system };
export * from "@faeca1/std";

function system(definition, opts) {
  const packages = { ...pkgs, ...opts?.packages };
  let obj = definition;

  const autoConfig = opts?.configure !== false;
  if (autoConfig) {
    const wrapped = config(definition.config);

    obj = { ...definition, config: wrapped };
  }

  return System(obj, { factory, ...opts, packages, autoConfig });
}
