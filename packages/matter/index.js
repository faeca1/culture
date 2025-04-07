import config from "@faeca1/config";
import std from "@faeca1/std";
import System from "@faeca1/system";
const pkgs = std.packages;

std.config = config;
std.system = system;
std.system.create = System.create;
std.system.runner = System.runner;
std.system.start = System.start;
std.system.stop = System.stop;
export default std;
export { config, system };


function system(definition, opts) {
  const packages = { ...pkgs, ...opts?.packages };
  return System(definition, { ...opts, packages });
}
