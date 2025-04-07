export default function env(postProcessors = []) {
  return async function envLoader() {
    let config = process.env;
    for (const processor of postProcessors) {
      config = await processor(config);
    }
    return config;
  };
}
