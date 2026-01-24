export default server;


function server(options = {}) {
  const name = options.name || 'server'

  let config
  let logger
  let server

  async function start(dependencies) {
    config = {
      ...{ host: '0.0.0.0', keepAliveTimeout: 5000, port: 8000 },
      ...dependencies.config
    }
    const app = dependencies.app

    if (!app) throw new Error('app is required')
    if (!config.port) throw new Error('config.port is required')

    logger = (dependencies.logger?.child?.({ component: name })) || noop();

    logger.info(`Starting server on ${config.host}:${config.port} with keepAliveTimeout of ${config.keepAliveTimeout}ms`)

    server = await app
      .start(config.port)
      // try to handle case when we are given back an external uWebsocket server instance 
      .catch((e) => { if (Object.getPrototypeOf(e) === null) { return e; } else { throw e; } })

    server.keepAliveTimeout = config.keepAliveTimeout

    return server
  }

  async function stop() {
    if (!server) return
    logger.info(`Stopping server on ${config.host}:${config.port}`)
    await server.close();
  }

  return { start, stop }
}


function noop() {
  return { debug() { }, info() { }, warn() { }, error() { } };
}
