import config from "@faeca1/config";
import std from "@faeca1/std";
import System from "@faeca1/system";
const pkgs = std.packages;

std.config = config;
std.system = system;
Object.keys(System).forEach(k => {
  std.system[k] = System[k];
});

export default std;
export { config, std as _, system };
export * from "@faeca1/std";

function system(definition, opts) {
  const packages = { ...pkgs, ...opts?.packages };
  return System(definition, { ...opts, packages });
}
