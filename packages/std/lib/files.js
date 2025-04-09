import fs from "node:fs/promises";
import path from "node:path";
import { _ } from "@faeca1/plug";

const write = _.curry(writer);
export default { toPathParts, writeAsJson, write };
export { toPathParts, writeAsJson, write };


function _deepDirectoryStructure(config, nameFn, data) {
  const { source, type, timestamp } = data;
  const { year, month, day } = _toDateParts(timestamp);
  const parts = [config.directory, source, type, year, month, day, timestamp];

  const dirPath = path.join(...parts.filter(x => !!x).map(_str));
  const filename = typeof nameFn === "string" ? nameFn : nameFn(data);

  return { dir: dirPath, filename };
}


function _regularDirectoryStructure(dir, nameFn, data) {
  const { source, type, timestamp } = data;
  const parts = [dir, source, type, timestamp];

  const dirPath = path.join(...parts.filter(x => !!x).map(_str));
  const filename = typeof nameFn === "string" ? nameFn : nameFn(data);

  return { dir: dirPath, filename };

}


function _shallowDirectoryStructure(dir, nameFn, data) {
  const { source, type, timestamp } = data;
  const parts = [source, type, timestamp];
  const subpath = parts.filter(x => !!x).join("-");

  const dirPath = path.join(dir, subpath);
  const filename = typeof nameFn === "string" ? nameFn : nameFn(data);

  return { dir: dirPath, filename };
}


function _flatDirectoryStructure(dir, nameFn, data) {
  const namer = typeof nameFn === "string" ? () => nameFn : nameFn;
  const { source, type, timestamp } = data;
  const parts = [source, type, timestamp, namer(data)];
  const filename = parts.filter(x => !!x).join("-");

  return { dir, filename };

}


function _str(x) {
  return _.isNil(x) ? null : _.isString(x) ? x : "" + x;
}


function _toDateParts(timestamp) {
  if (!timestamp) return {};

  const date = new Date(timestamp);
  return {
    year: date.getUTCFullYear(),
    month: 1 + (date.getUTCMonth()),
    day: date.getUTCDate(),
  };
}


function toPathParts({ config }, nameFn, data) {
  let parts;

  if (config.structure === "deep") {
    parts = _deepDirectoryStructure(config, nameFn, data);
  } else if (config.structure === "regular") {
    parts = _regularDirectoryStructure(config.directory, nameFn, data);
  } else if (config.structure === "shallow") {
    parts = _shallowDirectoryStructure(config.directory, nameFn, data);
  } else {
    parts = _flatDirectoryStructure(config.directory, nameFn, data);
  }

  return parts;
}


async function writeAsJson(dir, filename, data) {
  if (typeof dir === "object") {
    data = filename;
    filename = dir.filename;
    dir = dir.dir;
  }

  await fs.mkdir(dir, { recursive: true });
  const filepath = path.resolve(dir, `${filename}.json`);
  return fs.writeFile(filepath, JSON.stringify(data));
}


function writer({ config }, nameFn, data) {
  const parts = toPathParts({ config }, nameFn, data);
  return writeAsJson(parts, data);
}

