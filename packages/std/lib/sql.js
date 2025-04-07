import core from "@faeca1/plug";
const _ = core._;

export default {
  call: _.curry(call),
  query: _.curry(query),
  thunk: _.curry(thunk)
};


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
