import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getStarStates } from "./rating.ts";

describe("getStarStates", () => {
  it("represents whole-star ratings accurately", () => {
    assert.deepEqual(getStarStates(3), ["full", "full", "full", "empty", "empty"]);
  });

  it("represents half-star ratings accurately", () => {
    assert.deepEqual(getStarStates(4.5), ["full", "full", "full", "full", "half"]);
  });

  it("clamps out-of-range values", () => {
    assert.deepEqual(getStarStates(7), ["full", "full", "full", "full", "full"]);
    assert.deepEqual(getStarStates(-2), ["empty", "empty", "empty", "empty", "empty"]);
  });
});
