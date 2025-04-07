import _ from "lodash/fp";
import ajv from "ajv";
import bole from "bole";
import * as commander from "commander";
import debug from "debug";
import httpErrors from "http-errors";
import * as immer from "immer";
import json from "tiny-json-body-parser";
import lruCache from "lru-cache";
import multimethod from "@arrows/multimethod";
import postgres from "postgres";
import qs from "qs";
import * as queueable from "queueable";
import restana from "restana";

export default {
  _,
  ajv,
  bole,
  commander,
  debug,
  httpErrors,
  immer,
  json,
  lruCache,
  multimethod,
  optional,
  postgres,
  qs,
  queueable,
  restana
};

function optional(str, defaultValue) {
  try {
    return require(str);
  } catch (_ex) {
    return defaultValue ?? null;
  }
}


