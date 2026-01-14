import { _ } from "@faeca1/plug";

export default {
  db,
  call: _.curry(call),
  query: _.curry(query),
  thunk: _.curry(thunk),
};

function optional(name) {
  try {
    return require(name);
  } catch {
    return null;
  }
}

function db({ postgres }) {
  const tracer = optional("dd-trace");

  if (tracer) {
    const opName = "postgres.query";
    return {
      call(fnName, params) {
        return tracer.trace(opName, { resource: fnName }, () =>
          call(postgres, fnName, params),
        );
      },
      query(text, values) {
        return tracer.trace(opName, { resource: text.substring(0, 40) }, () =>
          query(postgres, text, values),
        );
      },
    };
  }

  return {
    call(fnName, params) {
      return call(postgres, fnName, params);
    },
    query(text, values) {
      return query(postgres, text, values);
    },
  };
}

function thunk(db, text) {
  return () => query(db, text);
}

function query(db, text, values) {
  return db.queryRaw(text, values);
}

function call(db, fnName, params) {
  return query(db, `SELECT ${fnName}($1) AS result;`, [params]).then(
    _.pipe(_.head, _.prop("result")),
  );
}
