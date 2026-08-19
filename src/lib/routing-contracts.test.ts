import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Phase 2 routing contracts", () => {
  it("keeps the legacy /products handoff in Next config instead of getStaticProps", () => {
    const config = readFileSync(
      new URL("../../next.config.ts", import.meta.url),
      "utf8",
    );

    assert.match(config, /source:\s*"\/products"/);
    assert.match(config, /destination:\s*"\/products\/one-life"/);
    assert.match(config, /permanent:\s*false/);

    assert.equal(
      existsSync(new URL("../pages/products/index.tsx", import.meta.url)),
      false,
    );
  });
});