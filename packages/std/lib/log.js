export function withChildLogger(obj, name) {
  return { ...obj, logger: child(obj.logger, name) };
}


export function child(logger, name) {
  if (!logger) return { debug() { }, info() { }, warn() { }, error() { }, trace() { } };
  if (!logger.child) return logger;
  return logger.child({ component: name });
}


