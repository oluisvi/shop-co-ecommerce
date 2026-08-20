import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("Phase 2 visual experience contracts", () => {
  it("loads WebGL only when motion and device capability allow it", () => {
    const source = readSource("../components/HeroExperience.tsx");

    assert.match(source, /prefers-reduced-motion: reduce/);
    assert.match(source, /chooseCapabilityTier/);
    assert.match(source, /saveData/);
    assert.match(source, /tier !== "A" \? <HeroScene \/>/);
    assert.match(source, /dynamic\(\(\) => import\("\.\/HeroScene"\)/);
    assert.match(source, /ssr: false/);

    // Mobile WebGL is now intentional; the old desktop-only gate must stay gone.
    assert.doesNotMatch(source, /min-width: 768px/);
  });

  it("uses the local fashion figure GLB instead of the old garment-texture scene", () => {
    const source = readSource("../components/HeroScene.tsx");

    assert.match(source, /GLTFLoader/);
    assert.match(source, /\/models\/fashion_figure_base\.glb/);
    assert.match(source, /new THREE\.Box3\(\)\.setFromObject/);
    assert.match(source, /targetHeight = 3\.4/);
    assert.match(source, /fashion-rack-static/);

    assert.doesNotMatch(source, /garmentTextures/);
    assert.doesNotMatch(source, /TorusKnotGeometry/);
  });

  it("pauses the 3D scene when it is not useful and disposes GPU resources", () => {
    const source = readSource("../components/HeroScene.tsx");

    assert.match(source, /IntersectionObserver/);
    assert.match(source, /visibilitychange/);
    assert.match(source, /ResizeObserver/);
    assert.match(source, /setAnimationLoop/);

    assert.match(source, /object\.geometry\.dispose\(\)/);
    assert.match(source, /mapped\.map\?\.dispose\(\)/);
    assert.match(source, /mapped\.normalMap\?\.dispose\(\)/);
    assert.match(source, /mapped\.roughnessMap\?\.dispose\(\)/);
    assert.match(source, /mapped\.metalnessMap\?\.dispose\(\)/);
    assert.match(source, /material\.dispose\(\)/);
    assert.match(source, /renderer\.dispose\(\)/);
  });

  it("keeps reduced-motion overrides and the editorial motion primitives", () => {
    const phase2 = readSource("../styles/phase2.css");
    const home = readSource("../pages/index.tsx");

    assert.match(home, /className="style-grid"/);
    assert.match(phase2, /prefers-reduced-motion:\s*reduce/);
    assert.match(phase2, /\.logo-loop__track/);
    assert.match(phase2, /\.reveal\.is-prepared/);
  });

  it("does not keep the accidental terminal-output file in the repository", () => {
    assert.equal(existsSync(new URL("../../t", import.meta.url)), false);
  });
});
