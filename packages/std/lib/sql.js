import { _ } from "@faeca1/plug";

export default {
  db,
  call: _.curry(call),
  query: _.curry(query),
  thunk: _.curry(thunk)
};


function db({ postgres }) {
  return {
    call(fnName, params) {
      return call(postgres, fnName, params);
    },
    query(text, values) {
      return query(postgres, text, values);
    }
  };
}


function thunk(db, text) {
  return () => query(db, text);
}


function query(db, text, values) {
  return db.queryRaw(text, values);
}


function call(db, fnName, params) {
  return query(db, `SELECT ${fnName}($1) AS result;`, [params])
    .then(_.pipe(_.head, _.prop("result")));
}
