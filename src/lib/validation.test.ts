import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateEmail } from "./validation.ts";

describe("validateEmail", () => {
  it("requires an email address", () => {
    assert.equal(validateEmail("  "), "Enter your email address.");
  });

  it("rejects malformed addresses", () => {
    assert.equal(validateEmail("fashion@journal"), "Enter a valid email address.");
  });

  it("accepts a valid address with surrounding whitespace", () => {
    assert.equal(validateEmail("  reader@example.com "), null);
  });
});
