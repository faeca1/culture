import { _ } from "@faeca1/plug";
import csp from "./csp.js";

export { jobs, workers };


async function workers(deps) {
  const log = deps.logger?.child?.({ component: "boss-workers" }) || { debug() { } };

  const onJobs = afn => async (jobs) => {
    const results = [];
    for (const job of jobs) {
      const { id, name } = job;
      log.debug({ job: { id, name } }, "received job");

      const result = await afn(job.data);

      log.debug({ job: { id, name } }, "finished job");
      results.push(result);
    }
    return results;
  };

  const ws = [];
  for (const w of deps.config) {
    await deps.boss.createQueue(w.queue);
    const handler = typeof w.handler !== "string" ? w.handler : _.get(w.handler)(deps);
    const worker = await deps.boss.work(w.queue, w.options, onJobs(handler));
    ws.push(worker);
  }

  return ws;
}


async function jobs(deps) {
  const log = deps.logger?.child?.({ component: "boss-jobs" }) || { debug() { } };

  const js = {};

  for (const { name, queue, options } of deps.config) {
    await deps.boss.createQueue(queue);
    const chan = csp.chan();
    js[name ?? queue] = (x) => chan.push(x);
    csp.go(async () => {
      for await (const data of chan) {
        const id = await deps.boss.send(queue, data, options);
        log.debug(`created job ${id} in queue ${queue}`);
      }
    });
  }

  return js;
}
