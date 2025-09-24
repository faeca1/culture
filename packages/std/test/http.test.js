import { describe, expect, test, mock } from "bun:test";
import _clock from "../lib/clock.js";
import _fetch from "../lib/fetch.js";
import http from "../lib/http.js";

describe("http", () => {
  describe("get", () => {
    test.todo("only req data provided, no deps", async () => {});
    test.todo("only url string provided, no deps", async () => {});
    test.todo("provided string", async () => {});

    test("no details", async () => {
      expect(
        await http.get(
          {
            clock: _clock.fake(),
            config: { baseUrl: "http:localhost:4321/api" },
            fetch: _fetch.fake(),
          },
          {
            path: "/toppings/1",
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "body": {},
          "headers": {},
          "ok": true,
          "status": 200,
        }
      `);
    });

    test("basic correct shape", async () => {
      expect(
        await http.get(
          {
            clock: _clock.fake(),
            config: {
              details: true,
              baseUrl: "http:localhost:4321/api",
            },
            fetch: _fetch.fake(),
          },
          {
            path: "/toppings/1",
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "detailed": true,
          "duration": 1,
          "req": {
            "baseUrl": "http:localhost:4321/api",
            "headers": {
              "User-Agent": "@faeca1/std:0.10.0",
            },
            "method": "GET",
            "path": "/toppings/1",
            "url": "http:localhost:4321/api/toppings/1",
          },
          "res": {
            "body": {},
            "headers": {},
            "ok": true,
            "status": 200,
          },
          "timestamp": 1231006505000,
        }
      `);
    });

    test("full shape", async () => {
      expect(
        await http.get(
          {
            clock: _clock.fake(),
            config: {
              baseUrl: "http:localhost:4321/api",
              source: "pizza",
              token: "secretsecret",
              userAgent: "testing",
              details: true,
            },
            fetch: _fetch.fake(),
          },
          {
            path: "/toppings/1",
            type: "getToppings",
            params: { id: 1 },
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "detailed": true,
          "duration": 1,
          "params": {
            "id": 1,
          },
          "req": {
            "baseUrl": "http:localhost:4321/api",
            "headers": {
              "Authorization": "<HIDDEN>",
              "User-Agent": "testing",
            },
            "method": "GET",
            "path": "/toppings/1",
            "url": "http:localhost:4321/api/toppings/1",
          },
          "res": {
            "body": {},
            "headers": {},
            "ok": true,
            "status": 200,
          },
          "source": "pizza",
          "timestamp": 1231006505000,
          "type": "getToppings",
        }
      `);
    });
  });

  describe("post", () => {
    test.todo("only req data provided, no deps", async () => {});
    test.todo("only url string provided, no deps", async () => {});
    test.todo("provided string", async () => {});

    test("no details", async () => {
      expect(
        await http.post(
          {
            clock: _clock.fake(),
            config: {
              baseUrl: "http:localhost:4321/api",
            },
            fetch: _fetch.fake(),
          },
          {
            path: "/toppings/1",
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "body": {},
          "headers": {},
          "ok": true,
          "status": 200,
        }
      `);
    });

    test("basic correct shape", async () => {
      expect(
        await http.post(
          {
            clock: _clock.fake(),
            config: {
              baseUrl: "http:localhost:4321/api",
              details: true,
            },
            fetch: _fetch.fake(),
          },
          {
            path: "/toppings",
            type: "postToppings",
            params: { name: "olives" },
            body: { foo: "bar", name: "olives" },
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "detailed": true,
          "duration": 1,
          "params": {
            "name": "olives",
          },
          "req": {
            "baseUrl": "http:localhost:4321/api",
            "body": {
              "foo": "bar",
              "name": "olives",
            },
            "headers": {
              "Content-Type": "application/json; charset=UTF-8",
              "User-Agent": "@faeca1/std:0.10.0",
            },
            "method": "POST",
            "path": "/toppings",
            "url": "http:localhost:4321/api/toppings",
          },
          "res": {
            "body": {},
            "headers": {},
            "ok": true,
            "status": 200,
          },
          "timestamp": 1231006505000,
          "type": "postToppings",
        }
      `);
    });

    test("full shape", async () => {
      expect(
        await http.post(
          {
            clock: _clock.fake(),
            config: {
              baseUrl: "http:localhost:4321/api",
              source: "pizza",
              token: "secretsecret",
              userAgent: "testing",
              details: true,
            },
            fetch: _fetch.fake(),
          },
          {
            path: "/toppings",
            type: "postToppings",
            params: { name: "olives" },
            body: { foo: "bar", name: "olives" },
          },
        ),
      ).toMatchInlineSnapshot(`
        {
          "detailed": true,
          "duration": 1,
          "params": {
            "name": "olives",
          },
          "req": {
            "baseUrl": "http:localhost:4321/api",
            "body": {
              "foo": "bar",
              "name": "olives",
            },
            "headers": {
              "Authorization": "<HIDDEN>",
              "Content-Type": "application/json; charset=UTF-8",
              "User-Agent": "testing",
            },
            "method": "POST",
            "path": "/toppings",
            "url": "http:localhost:4321/api/toppings",
          },
          "res": {
            "body": {},
            "headers": {},
            "ok": true,
            "status": 200,
          },
          "source": "pizza",
          "timestamp": 1231006505000,
          "type": "postToppings",
        }
      `);
    });
  });
});
