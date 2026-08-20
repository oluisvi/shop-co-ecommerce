import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("archive commerce experience", () => {
  it("renders sold cards as browsable editorial objects without a disabled purchase CTA", () => {
    const card = read("../components/ProductCard.tsx");
    assert.match(card, /product\.availability === "SOLD"/);
    assert.match(card, /SOLD/);
    assert.match(card, /isOneOfOne/);
    assert.doesNotMatch(card, /disabled=!\{variantId\}/);
  });

  it("publishes Product JSON-LD with authoritative availability", () => {
    const detail = read("../pages/products/[slug].tsx");
    assert.match(detail, /application\/ld\+json/);
    assert.match(detail, /https:\/\/schema\.org\/SoldOut/);
    assert.match(detail, /https:\/\/schema\.org\/InStock/);
  });

  it("passes the capability tier into the Three scene", () => {
    assert.match(read("../components/HeroExperience.tsx"), /<HeroScene tier=\{tier\}/);
    assert.match(read("../components/HeroScene.tsx"), /tier === "C"/);
  });
});
