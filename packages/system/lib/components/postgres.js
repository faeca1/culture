import { performance } from 'perf_hooks';

export default function(options = {}) {
  const pg = options.postgres;
  const name = options.name || 'postgres'
  let config, log, sql, url

  return { start, stop }

  async function start(deps) {
    if (!deps.config) throw new Error('config is required')
    if (!deps.config.connectionString) throw new Error('config.connectionString is required')

    config = { ...deps.config };
    const component = config.name || name;
    log = deps.logger?.child?.({ component })
      || deps.logger
      || { debug() { }, info() { }, error() { } };
    url = new URL(config.connectionString);

    const opts = { ...config };
    if (url.searchParams.get('sslmode') === 'no-verify')
      opts.ssl = { rejectUnauthorized: false }

    sql = new pg(config.connectionString, opts)

    log.info(`Connected to ${redacted(url)}`)
    sql.query = query;
    sql.queryRaw = queryRaw;

    return sql;
  }

  async function stop() {
    if (!sql) return
    await sql.end({ timeout: 1 })
    log.info(`Disconnected from ${redacted(url)}`)
  }

  async function query(text, ...values) {
    return _query(text, values);
  }

  async function queryRaw(text, values = []) {
    const xs = text.split(/\$\d/)
    Object.defineProperty(xs, 'raw', { enumerable: false, writable: true });
    xs.raw = [text]
    return _query(xs, values);
  }

  async function _query(text, values) {
    const start = performance.now()
    try {
      const results = await sql(text, ...values)
      const elapsed = performance.now() - start
      const context = { query: { text: text.raw } };
      if (config.logValues) context.query.values = values;
      log.debug(context, `query took ${Math.ceil(elapsed)}ms`)
      return results
    } catch (err) {
      const elapsed = performance.now() - start
      const context = { query: { text, err } };
      if (config.logValues) context.query.values = values;
      log.error(context, `query took ${Math.ceil(elapsed)}ms`)
      throw err
    }
  }

  function json(obj) {
    return sql.json(obj)
  }

  function redacted(url) {
    return `postgres://${url.host || 'localhost:5432'}${url.pathname || '/postgres'}`
  }
}
