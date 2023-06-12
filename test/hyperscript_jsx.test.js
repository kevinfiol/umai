import { suite } from "flitch";
import { strict as assert } from "node:assert";
import { m } from "../index.js";
const test = suite("hyperscript jsx");
const COMPONENT = 2;
const ELEMENT = 1;
const TEXT = 3;
test("simple elements", () => {
  assert.deepEqual(
    /* @__PURE__ */ m("div", null, "test"),
    {
      tag: "div",
      type: ELEMENT,
      key: void 0,
      props: {},
      children: [
        { type: TEXT, tag: "test" }
      ]
    }
  );
});
test("class strings", () => {
  assert.deepEqual(
    /* @__PURE__ */ m("div", { class: "one two three" }),
    {
      tag: "div",
      type: ELEMENT,
      key: void 0,
      props: { class: "one two three" },
      children: []
    }
  );
});
test("class builder", () => {
  assert.deepEqual(
    /* @__PURE__ */ m("div", { class: { one: true, two: false, three: true } }),
    {
      tag: "div",
      type: ELEMENT,
      key: void 0,
      props: { class: "one three" },
      children: []
    }
  );
});
test("props", () => {
  assert.deepEqual(
    /* @__PURE__ */ m("div", { one: 2 }),
    {
      tag: "div",
      type: ELEMENT,
      key: void 0,
      props: { one: 2 },
      children: []
    }
  );
});
test("element children", () => {
  assert.deepEqual(
    /* @__PURE__ */ m("div", null, /* @__PURE__ */ m("p", null, "one")),
    {
      tag: "div",
      type: ELEMENT,
      key: void 0,
      props: {},
      children: [
        {
          tag: "p",
          type: ELEMENT,
          key: void 0,
          props: {},
          children: [
            { type: TEXT, tag: "one" }
          ]
        }
      ]
    }
  );
});
test("component types", () => {
  const Comp = () => m("p", "sup");
  assert.deepEqual(
    /* @__PURE__ */ m(Comp, { one: 2 }, /* @__PURE__ */ m("p", null, "child")),
    {
      tag: Comp,
      type: COMPONENT,
      key: void 0,
      props: { one: 2 },
      children: [
        {
          tag: "p",
          type: ELEMENT,
          key: void 0,
          props: {},
          children: [
            { type: TEXT, tag: "child" }
          ]
        }
      ]
    }
  );
});
