import { describe, test, expect, spyOn } from "bun:test";
import _ from "..";

describe("web", () => {
  test("middleware handlers correctly wrap", async () => {
    const fns = { foo: ({ maths }, req) => maths.double(req.params.id) };
    const maths = {
      double(i) {
        return 2 * i;
      },
    };
    const middleware = _.web.handlers(fns)({ maths });
    const req = { params: { id: Math.PI } };
    const res = { send() {} };
    const spy = spyOn(res, "send");

    await middleware.foo(req, res);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`6.283185307179586`);
  });
});
