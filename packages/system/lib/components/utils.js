export function noop() {
  return { debug() { }, info() { }, warn() { }, error() { } };
}

export function optional(str, defaultValue) {
  try {
    return require(str);
  } catch (_ex) {
    return defaultValue ?? null;
  }
}



