import Core from "@faeca1/plug";

export default {
  chan,
  go,
  put,
  take,
  toMe,
  toYou
};


function chan() {
  return new Core.queueable.Channel();
}


function go(fn, ...params) {
  return fn(...params);
}


function put(ch, val, isDone) {
  return ch.push(val, isDone);
}


function take(ch) {
  return ch[Symbol.asyncIterator]().next();
}


function toMe(fn, ch, onReturn) {
  const c = ch || chan();
  go(async () => {
    for await (const v of c) {
      await put(c, await fn(v));
    }
    if (onReturn) onReturn();
  });
  return c;
}


async function toYou(ch, val) {
  await put(ch, val);
  return take(ch);
}
