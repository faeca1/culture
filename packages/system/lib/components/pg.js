import { performance } from "perf_hooks";

export default component;


function component(options = {}) {
  const pg = options.pg;
  const name = options.name || "postgres";

  let pool;
  let config;
  let log;

  async function query(text, values) {
    const query = typeof text === "string" ? { text, values } : text;
    const logResults = query.logResults !== false;
    const start = performance.now();
    try {
      const results = await pool.query(query).then((x) => x.rows);
      const elapsed = performance.now() - start;
      const context = { query, elapsed };
      if (logResults) context.results = results;
      log.debug(context, "query took %dms", Math.ceil(elapsed));
      return results;
    } catch (err) {
      const elapsed = performance.now() - start;
      log.error({ query, err }, "query took %dms", Math.ceil(elapsed));
      throw err;
    }
  }

  function start(dependencies) {
    config = dependencies.config;
    log = dependencies.logger?.child?.({ component: name })
      || dependencies.logger || noop();

    if (!config) throw new Error("config is required");
    if (!config.connectionString) {
      throw new Error("config.connectionString is required");
    }

    log.info(`Connecting to ${getConnectionUrl()}`);

    pool = new pg.Pool(config);

    pool.on("connect", async (client) => {
      client.on("notice", function(notice) {
        switch (notice.severity) {
          case "DEBUG": {
            log.debug(notice.message);
            break;
          }
          case "LOG": {
            log.info(notice.message);
            break;
          }
          case "INFO": {
            log.info(notice.message);
            break;
          }
          case "NOTICE": {
            log.info(notice.message);
            break;
          }
          case "WARNING": {
            log.warn(notice.message);
            break;
          }
          case "EXCEPTION": {
            log.error(notice.message);
            break;
          }
          default: {
            log.error(notice.message);
            break;
          }
        }
      });
      for (const query of config.onConnect || []) {
        try {
          await client.query(query);
        } catch (err) {
          log.error(`Error running query: ${query}`, err);
        }
      }
    });
    pool.on("error", function(err) {
      log.warn("An idle client has experienced an error", err);
    });

    return { query, queryRaw: query, unwrap };
  }

  async function stop() {
    if (!pool) return;
    log.info(`Disconnecting from ${getConnectionUrl()}`);
    await pool.end();
  }

  function getConnectionUrl() {
    const url = new URL(config.connectionString);
    return `postgres://${url.host || "localhost:5432"}${url.pathname || "/postgres"
      }`;
  }

  return { start, stop };
};


function noop() {
  return {
    error() { },
    warn() { },
    info() { },
    debug() { },
  };
}


function unwrap(rows) {
  return rows?.[0]?.result;
}
