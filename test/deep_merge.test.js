import { deepMerge, deepCopy } from "../src/utils/deep_merge.js";

describe("deep_merge.js", () => {
  describe.each([
    {
      copier: (o, cnf) => deepMerge([o], cnf),
      name: "Single-arg deepMerge",
      id: "deepMerge"
    }, {
      copier: deepCopy,
      name: "deepCopy",
      id: "deepCopy"
    }, {
      copier: (o, cnf) => deepMerge([null, void 0, o, null, void 0], cnf),
      name: "deepMerge with some nulls",
      id: "withNulls"
    }
  ])("$name", ({ copier, id }) => {
    describe("Shallow primitive handling", () => {
      it.each([
        { name: "boolean", data: [true, false] },
        { name: "numbers", data: [0, -12, 9.7, NaN, Infinity] },
        {
          name: "bigint", data: [
            0n, 6543n, -8383n, -64547771112849427272721n, 61617349738546589193737113n]
        },
        { name: "strings", data: ["", "abc", "\x1b[0m\\+)"] },
        { name: "booleans", data: [true, false] },
        {
          name: "null-ish", data: [null, void 0],
          skip: (_d) => id === "withNulls"
        },
        {
          name: "symbols", data: [
            Symbol.unscopables, Symbol('u'), Symbol.for('_test_')]
        }
      ])("Returns $name directly", (obj) => {
        _runOnData(obj, (d) => {
          expect(copier(d)).toBe(d);
        })
      });
    })
    describe("Shallow Array handling", () => {
      it.each([
        { name: "empty array", data: [] },
        { name: "array with one elmenent", data: ["something"] },
        { name: "array with some elements", data: [
          1, "str", -9.12, 7n, Symbol('e'), true] },
        { name: "array with some nulls", data: [
          null, Symbol('q'), 86, false, void 0, "v"] },
        { name: "empty sparse array", data: new Array(1000)},
        { name: "Sparse array at end", data: [9, "e", Symbol('q'),,,,,,]}
      ])("$name", ({ data }) => {
        let arr = data;
        let arr2 = copier(arr);
        expect(arr === arr2).toBe(false);
        expect(arr2).toStrictEqual(arr);
        expect(arr2.constructor).toBe(Array);
      })
    })
  })
  it("Returns last null", () => {
    expect(deepMerge([null, void 0])).toBe(void 0);
    expect(deepMerge([void 0, null, null, void 0, null])).toBe(null);
  })
})


function _runOnData(obj, func){
  let { skip, data } = obj;
  if (typeof skip !== "function" && skip) return;
  for (const d of data) {
    if (typeof skip === "function" && skip(d)) continue;
    func(d);
  }
}
