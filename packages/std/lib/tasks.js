import { _ } from "@faeca1/plug";
import csp from "./csp.js";

export { jobs, pushedJobs, queues, workers };


async function queues(deps) {
  const log = deps.logger?.child?.({ component: "boss-queues" }) || noopLogger();

  const queues = [];
  for (const { name, options } of deps.config) {
    const queue = { name, options };

    const q = await deps.boss.createQueue(name, options);
    if (!q) {
      log.debug({ queue }, "queue already exists");
    } else {
      log.debug({ queue }, "created queue");
    }

    await deps.boss.updateQueue(name, options);
    log.debug({ queue }, "updated queue to ensure options set");

    queues.push(q);
  }

  return queues;
}


async function workers(deps) {
  const log = deps.logger?.child?.({ component: "boss-workers" }) || noopLogger();

  const onJobs = afn => async (jobs) => {
    const results = [];
    for (const job of jobs) {
      log.debug({ job }, "received job");
      const result = await afn(job.data);
      log.debug({ job }, "finished job");
      results.push(result);
    }
    return results;
  };

  const ws = [];
  for (const w of deps.config) {
    const worker = _.pick(['queue', 'options'])(w);
    if (typeof w.handler === "string") worker.handler = w.handler;

    try {
      await deps.boss.createQueue(w.queue);
      const handler = typeof w.handler !== "string" ? w.handler : _.get(w.handler)(deps);
      const wrkr = await deps.boss.work(w.queue, w.options, onJobs(handler));
      log.debug({ worker }, "created worker");
      ws.push(wrkr);
    } catch (error) {
      log.error({ error, worker }, "error creating worker");
    }
  }

  return ws;
}


async function pushedJobs(deps) {
  const log = deps.logger?.child?.({ component: "boss-pushed-jobs" }) || noopLogger();

  const js = {};

  for (const { name, queue, options } of deps.config) {
    await deps.boss.createQueue(queue);
    const chan = csp.chan();
    js[name ?? queue] = (x) => chan.push(x);

    csp.go(async () => {
      for await (const data of chan) {
        const job = { name, queue, data, options };
        try {
          const id = await deps.boss.send(queue, data, options);
          if (!id) {
            log.warn({ job }, "unable to create job");
          } else {
            job.id = id;
            log.debug({ job }, `created job ${id}`);
          }
        } catch (error) {
          log.error({ error, job }, "error trying to create job");
        }
      }
    });

    log.debug({ name, queue, options }, `created job handler ${name || queue}`);
  }

  return js;
}


async function jobs(deps) {
  const log = deps.logger?.child?.({ component: "boss-jobs" }) || noopLogger();
  const js = {};

  for (const { name, queue, options } of deps.config) {
    await deps.boss.createQueue(queue);

    js[name ?? queue] = async data => {
      const job = { name, queue, data, options };
      try {
        const id = await deps.boss.send(queue, data, options);
        if (!id) {
          log.warn({ job }, "unable to create job");
        } else {
          job.id = id;
          log.debug({ job }, `created job ${id}`);
        }
        return id;
      } catch (error) {
        log.error({ error, job }, "error trying to create job");
        throw error;
      }
    };

    log.debug({ name, queue, options }, `created job handler ${name || queue}`);
  }

  return js;
}


function noopLogger() {
  return { debug() { }, info() { }, error() { }, warn() { } };
}
