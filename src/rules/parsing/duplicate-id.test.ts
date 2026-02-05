import { describe, it, expect } from "vitest";
import { duplicateIdAria } from "./duplicate-id";

function makeDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("duplicate-id-aria", () => {
  it("reports duplicate IDs referenced by aria-labelledby", () => {
    const doc = makeDoc(
      '<html><body><div id="a">Label</div><div id="a">Dup</div><input aria-labelledby="a"></body></html>'
    );
    expect(duplicateIdAria.run(doc)).toHaveLength(1);
  });

  it("reports duplicate IDs referenced by label[for]", () => {
    const doc = makeDoc(
      '<html><body><input id="f"><input id="f"><label for="f">Name</label></body></html>'
    );
    const v = duplicateIdAria.run(doc);
    expect(v).toHaveLength(1);
    expect(v[0].message).toContain("label[for]");
  });

  it("ignores duplicate IDs not referenced by any accessibility attribute", () => {
    const doc = makeDoc(
      '<html><body><div id="a"></div><div id="a"></div></body></html>'
    );
    expect(duplicateIdAria.run(doc)).toHaveLength(0);
  });

  it("passes when referenced IDs are unique", () => {
    const doc = makeDoc(
      '<html><body><div id="a">Label</div><input aria-labelledby="a"></body></html>'
    );
    expect(duplicateIdAria.run(doc)).toHaveLength(0);
  });
});
