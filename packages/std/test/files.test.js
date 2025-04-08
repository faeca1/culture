import { beforeEach, describe, test, expect, mock } from "bun:test";

import Lib from '../lib/index.js';
const { toPathParts, writeAsJson, write } = Lib.files;

describe("writeAsJson", () => {
  const mkdir = mock(() => { });
  const writeFile = mock(() => { });


  beforeEach(() => {
    mock.module("node:fs/promises", () =>
      ({ default: { mkdir, writeFile } })
    );
    mkdir.mockReset();
    writeFile.mockReset();
  });


  test("accepts 3 arguments", async () => {
    await writeAsJson("./data", "pizza", { fizz: "buzz" });

    expect(mkdir).toHaveBeenCalledWith("./data", { recursive: true });
    expect(writeFile).toHaveBeenCalledOnce();

    const [[filepath, contents]] = writeFile.mock.calls;
    expect(filepath).toEqual(expect.stringContaining("/data/pizza.json"));
    expect(contents).toBe('{"fizz":"buzz"}');
  });


  test("accepts 2 arguments", async () => {
    await writeAsJson({ dir: "./data", filename: "pizza" }, { fizz: "buzz" });

    expect(mkdir).toHaveBeenCalledWith("./data", { recursive: true });
    expect(writeFile).toHaveBeenCalledOnce();

    const [[filepath, contents]] = writeFile.mock.calls;
    expect(filepath).toEqual(expect.stringContaining("/data/pizza.json"));
    expect(contents).toBe('{"fizz":"buzz"}');
  });
});


describe("write", () => {
  const mkdir = mock(() => { });
  const writeFile = mock(() => { });


  beforeEach(() => {
    mock.module("node:fs/promises", () =>
      ({ default: { mkdir, writeFile } })
    );
    mkdir.mockReset();
    writeFile.mockReset();
  });


  test("with string name", async () => {
    const config = { directory: "./data", structure: "regular" };
    const obj = { source: "food", type: "dinner", fizz: "buzz" };
    await write({ config }, "pizza", obj);

    expect(mkdir).toHaveBeenCalledWith("data/food/dinner", { recursive: true });
    expect(writeFile).toHaveBeenCalledOnce();

    const [[filepath, contents]] = writeFile.mock.calls;
    expect(filepath).toEqual(expect.stringContaining("/data/food/dinner/pizza.json"));
    expect(contents).toBe(JSON.stringify(obj));
  });


  test("with namer function", async () => {
    const config = { directory: "./data", structure: "regular" };
    const obj = { source: "food", type: "dinner", fizz: "buzz" };
    await write({ config }, x => `pizza-${x.fizz}`, obj);

    expect(mkdir).toHaveBeenCalledWith("data/food/dinner", { recursive: true });
    expect(writeFile).toHaveBeenCalledOnce();

    const [[filepath, contents]] = writeFile.mock.calls;
    expect(filepath).toEqual(expect.stringContaining("/data/food/dinner/pizza-buzz.json"));
    expect(contents).toBe(JSON.stringify(obj));
  });


  test("partially applied", async () => {
    const config = { directory: "./data", structure: "regular" };
    const obj = { source: "food", type: "dinner", fizz: "buzz" };
    const fn = write({ config }, x => `pizza-${x.fizz}`);

    await fn(obj);

    expect(mkdir).toHaveBeenCalledWith("data/food/dinner", { recursive: true });
    expect(writeFile).toHaveBeenCalledOnce();

    const [[filepath, contents]] = writeFile.mock.calls;
    expect(filepath).toEqual(expect.stringContaining("/data/food/dinner/pizza-buzz.json"));
    expect(contents).toBe(JSON.stringify(obj));
  });
});


describe("toPathPaths", () => {
  describe("deep structure", () => {
    const config = { directory: "data", structure: "deep" };
    const filename = "report";


    test("handles ordinary file", () => {
      const obj = { fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "report",
        }
      `);
    });


    test("handles file with source provenance", () => {
      const obj = { source: "elliptic", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic",
          "filename": "report",
        }
      `);
    });


    test("handles file with type provenance", () => {
      const obj = { type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/disco",
          "filename": "report",
        }
      `);
    });


    test("handles file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic/disco",
          "filename": "report",
        }
      `);
    });


    test("handles timestamped file", () => {
      const obj = { fizz: "buzz", timestamp: 1234567890 };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/1970/1/15/1234567890",
          "filename": "report",
        }
      `);
    });


    test("handles timestamped file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", timestamp: 1234567890, fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic/disco/1970/1/15/1234567890",
          "filename": "report",
        }
      `);
    });
  });


  describe("regular structure", () => {
    const config = { directory: "data", structure: "regular" };
    const filename = "report";


    test("handles ordinary file", () => {
      const obj = { fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "report",
        }
      `);
    });


    test("handles file with source provenance", () => {
      const obj = { source: "elliptic", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic",
          "filename": "report",
        }
      `);
    });


    test("handles file with type provenance", () => {
      const obj = { type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/disco",
          "filename": "report",
        }
      `);
    });


    test("handles file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic/disco",
          "filename": "report",
        }
      `);
    });


    test("handles timestamped file", () => {
      const obj = { fizz: "buzz", timestamp: 1234567890 };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/1234567890",
          "filename": "report",
        }
      `);
    });


    test("handles timestamped file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", timestamp: 1234567890, fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic/disco/1234567890",
          "filename": "report",
        }
      `);
    });
  });


  describe("shallow structure", () => {
    const config = { directory: "data", structure: "shallow" };
    const filename = "report";


    test("handles ordinary file", () => {
      const obj = { fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "report",
        }
      `);
    });


    test("handles file with source provenance", () => {
      const obj = { source: "elliptic", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic",
          "filename": "report",
        }
      `);
    });


    test("handles file with type provenance", () => {
      const obj = { type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/disco",
          "filename": "report",
        }
      `);
    });


    test("handles file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic-disco",
          "filename": "report",
        }
      `);
    });


    test("handles timestamped file", () => {
      const obj = { fizz: "buzz", timestamp: 1234567890 };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/1234567890",
          "filename": "report",
        }
      `);
    });


    test("handles timestamped file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", timestamp: 1234567890, fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data/elliptic-disco-1234567890",
          "filename": "report",
        }
      `);
    });
  });


  describe("flat structure", () => {
    const config = { directory: "data" };
    const filename = "report";


    test("handles ordinary file", () => {
      const obj = { fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "report",
        }
      `);
    });


    test("handles file with source provenance", () => {
      const obj = { source: "elliptic", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "elliptic-report",
        }
      `);
    });


    test("handles file with type provenance", () => {
      const obj = { type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "disco-report",
        }
      `);
    });


    test("handles file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "elliptic-disco-report",
        }
      `);
    });


    test("handles timestamped file", () => {
      const obj = { fizz: "buzz", timestamp: 1234567890 };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "1234567890-report",
        }
      `);
    });


    test("handles timestamped file with all provenance", () => {
      const obj = { source: "elliptic", type: "disco", timestamp: 1234567890, fizz: "buzz" };
      expect(toPathParts({ config }, filename, obj)).toMatchInlineSnapshot(`
        {
          "dir": "data",
          "filename": "elliptic-disco-1234567890-report",
        }
      `);
    });
  });
});

