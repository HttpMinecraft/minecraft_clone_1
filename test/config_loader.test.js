import './helpers/fetch_local_polyfill.js';
import "./helpers/dummy_dom.js"
import { isComment, parseJsonConfig } from "../src/config_loader.js";

describe("config_loader.js", () => {
  describe("isComment (unit test)", () => {
    describe.each([
      "$comment",
      "//",
      "$#",
      "#",
      "/*"
    ])("Handling of '%s' comments", (prefix) => {
      it("Recognises it as a comment", () => {
        expect(isComment(prefix)).toBe(true);
        expect(isComment(prefix + " xy")).toBe(true);
        expect(isComment(prefix + "abcd")).toBe(true);
      })
      it("Allows leading whitespace", () => {
        expect(isComment(" " + prefix)).toBe(true);
        expect(isComment("   \t " + prefix)).toBe(true);
      })
      it("Disallows leading non-whitespace chracters", () => {
        expect(isComment("ab" + prefix)).toBe(false);
        expect(isComment("xy " + prefix)).toBe(false);
        expect(isComment("  qr" + prefix)).toBe(false);
      })
    });
    it.each([
      "a",
      "%extends",
      "  something",
      "  \t \n  ",
      ""
    ])("Doesn't recognise %o as a comment", (s) => {
      expect(isComment(s)).toBe(false);
    });
  });
  describe("parseJsonConfig", () => {
    describe("Normal JSON handling", () => {test_normalJsonHandling()});
    describe("Comment handling (integration test)", () => {
      describe.each([
        "$comment",
        "//",
        "$#",
        "#",
        "/*"
      ])("Handling of '%s' comments", (prefix) => {
        it("Handles single-key objects", () => {
          let data = {[`${prefix}xyz`]: -3.4};
          let s = JSON.stringify(data);
          expect(parseJsonConfig(s)).toStrictEqual({});
        });
        it("Handles normal objects", () => {
          function getData() {
            return {attr: {y: [""]}, normal: [{t: 0}]};
          }
          let data = getData();
          data[`${prefix}xyz`] = {q: 8, i: [2, "a"]};
          let s = JSON.stringify(data);
          expect(parseJsonConfig(s)).toStrictEqual(getData());
        })
      })
      
    })
  })
})


function test_normalJsonHandling() {
  it("Handles string literals", () => {
    expect(parseJsonConfig(`"a string value"`))
      .toStrictEqual("a string value");
    expect(parseJsonConfig(`"a str \\t\\n\\\\ value"`))
      .toStrictEqual("a str \t\n\\ value");
    expect(parseJsonConfig(`""`)).toStrictEqual("");
  });
  it("Handles whole numbers", () => {
    expect(parseJsonConfig("123")).toBe(123);
    expect(parseJsonConfig("-97")).toBe(-97);
    expect(parseJsonConfig("0")).toBe(0);
    expect(parseJsonConfig("-0")).toBe(-0);
  });
  it("Handles floating point numbers", () => {
    expect(parseJsonConfig("769.02")).toBe(769.02);
    expect(parseJsonConfig("-902.4")).toBe(-902.4);
    expect(parseJsonConfig("-3.2e-40")).toBe(-3.2e-40);
    expect(parseJsonConfig("7.6e80")).toBe(7.6e80);
  });
  it("Handles null", () => {
    expect(parseJsonConfig("null")).toBe(null);
  });
  it("Handles booleans", () => {
    expect(parseJsonConfig("true")).toBe(true);
    expect(parseJsonConfig("false")).toBe(false);
  });
  describe("object/list handling", () => {
    describe("Non-nested array handling", () => {
      it.each([
        { name: "array of numbers", data: [0, 1.76, -0.1, -76, 0.0] },
        {
          name: "array of strings",
          data: ["a string", "a \nother \t str\n\nthis:\\ is a \"backslash'", '']
        },
        {
          name: "mixed array (string and number)",
          data: [-0.0, "string\n\ts\nstr \\not a newline", 5.6, ""],
          str: `[-0.0, ${JSON.stringify("string\n\ts\nstr \\not a newline")
            }, 5.6, ""]`
        },
        { name: "array with nulls", data: [2.4, null, "text", null] },
        { name: "empty array", data: [] },
      ])("$name", ({ data, str = null }) => {
        str = str ?? JSON.stringify(data);
        expect(parseJsonConfig(str)).toStrictEqual(data);
      })
    });
    describe("Non-nested object handling", () => {
      it.each([
        { name: "object of number values", data: { d: 4.2, e: -9, f: 0.0 } },
        {
          name: "object of string values",
          data: { r: "abc", d: "", c: "  \n\t\t\\\t\n, not a \\newline" }
        },
        {
          name: "mixed object: (string and number values)",
          data: { q: -0, a: "string\n\ts\nstr \\not a newline", c: 5.6, d: "" },
          str: `{"q": -0, "a":${JSON.stringify("string\n\ts\nstr \\not a newline")
            }, "c": 5.6, "d": ""}`
        },
        { name: "object with nulls", data: { a: 4.5, b: null, c: "str" } },
        { name: "empty object", data: {} },
      ])("$name", ({ data, str = null }) => {
        str = str ?? JSON.stringify(data);
        expect(parseJsonConfig(str)).toStrictEqual(data);
      });
    });
    describe("Nested object/array handling", () => {
      it.each([
        {
          name: "nested object (no arrays)",
          data: { a: 2.3, b: {}, c: { r: "9.3", d: null, e: { f: 6 } }, g: { e: 2.2 } }
        },
        {
          name: "nested array (no objects)",
          data: [-4, null, ["a\n  \t\\n", 4.2, []], "e", 3.30227, [5.5]]
        },
        {
          name: "object as toplevel",
          data: { a: 54, d: null, c: [-0.2, "qw", { a: "\\\t", abc: [] }], e: { w: {} } }
        },
        {
          name: "array as toplevel",
          data: ["54", null, [],
            { q: null, v: 4.23, h: { x: 0 }, a: [-2.3] }, ["3.4", -1.02], {}]
        }
      ])("$name", ({ data, str = null }) => {
        str = str ?? JSON.stringify(data);
        expect(parseJsonConfig(str)).toStrictEqual(data);
      });
    })
  })
}
