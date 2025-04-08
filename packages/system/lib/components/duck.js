export default function component(options) {
  let duckdb = options.duckdb;

  return {
    async start({ config } = {}) {
      const instance = await duckdb.DuckDBInstance.create(config?.db || ":memory:");
      const db = await instance.connect();
      return db;
    }
  }
}

