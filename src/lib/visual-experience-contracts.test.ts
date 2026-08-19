import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("rebrand v2 visual experience contracts", () => {
  it("loads the WebGL enhancement only for wider screens without reduced motion", () => {
    const source = readSource("../components/HeroExperience.tsx");

    assert.match(source, /min-width: 768px/);
    assert.match(source, /prefers-reduced-motion: reduce/);
    assert.match(source, /dynamic\(\(\) => import\("\.\/HeroScene"\)/);
    assert.match(source, /ssr: false/);
  });

  it("pauses the 3D scene when it is not useful and disposes GPU resources", () => {
    const source = readSource("../components/HeroScene.tsx");

    assert.match(source, /IntersectionObserver/);
    assert.match(source, /visibilitychange/);
    assert.match(source, /ResizeObserver/);
    assert.match(source, /setAnimationLoop/);
    assert.match(source, /renderer\.dispose\(\)/);
    assert.match(source, /mainGeometry\.dispose\(\)/);
  });

  it("uses an explicit editorial grid for style cards and a tablet catalog drawer", () => {
    const source = readSource("../styles/experience.css");

    assert.match(source, /grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(source, /min-width:\s*768px\)\s*and\s*\(max-width:\s*1099px/);
    assert.match(source, /\.filter-panel\.is-open/);
    assert.match(source, /translateX\(100%\)/);
  });

  it("does not keep the accidental terminal-output file in the repository", () => {
    assert.equal(existsSync(new URL("../../t", import.meta.url)), false);
  });
});
