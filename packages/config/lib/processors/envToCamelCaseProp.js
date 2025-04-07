import _ from "@faeca1/std";

init.envToCamelCaseProps = envToCamelCaseProps;
export default init;
export { init, envToCamelCaseProps };


function init(opts) {
  const options = _.merge({ prefix: "", filter: /.*/ }, opts);
  return (config) => envToCamelCaseProps(options, config);
}


function envToCamelCaseProps(options, obj) {
  const stripPrefix = (prefix) => (key) =>
    key.replace(new RegExp(`^${prefix}`), "");

  const toPropertyPath = (key) =>
    key.toLowerCase().split("__").map(_.camelCase).join(".");

  return _.pipe(
    _.pickBy((__, k) => options.filter.test(k)),
    _.mapKeys(_.pipe(stripPrefix(options.prefix), toPropertyPath)),
    _.entries,
    _.reduce((acc, [k, v]) => _.set(k, v)(acc), {}),
  )(obj);
}
