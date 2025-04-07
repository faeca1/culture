import path from "node:path";
import fs from "node:fs/promises";


export default function importer(opts, postProcessors = []) {
  return async function importLoader() {
    if (!opts.path) {
      throw new Error("path is required");
    }
    const resolved = path.resolve(opts.path);
    await fs.stat(resolved);
    let config = await import(resolved);
    if (config?.default) { config = config.default; }

    for (const processor of postProcessors) {
      config = await processor(config);
    }

    return config;
  };
}
