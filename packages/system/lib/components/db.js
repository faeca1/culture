import { optional } from "./utils.js";

export default function component() {
  return {
    start({ postgres }) {
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
    },
  };
}

function query(db, text, values) {
  return db.queryRaw(text, values);
}

async function call(db, fnName, params) {
  const resp = await query(db, `SELECT ${fnName}($1) AS result;`, [params]);
  return resp?.[0]?.result;
}
