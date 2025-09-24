export function withChildLogger(obj, name) {
  return { ...obj, logger: child(obj.logger, name) };
}

export function child(logger, name) {
  if (!logger) return fake();
  if (!logger.child) return logger;
  return logger.child({ component: name });
}

export function fake() {
  return {
    child() {
      return fake();
    },
    trace() {},
    debug() {},
    info() {},
    warn() {},
    error() {},
  };
}
