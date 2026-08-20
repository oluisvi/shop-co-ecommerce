import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("production security contracts", () => {
  it("globally throttles API traffic but never throttles Stripe webhook delivery", () => {
    expect(read("./app.module.ts")).toMatch(/ThrottlerGuard/);
    expect(read("./modules/payments/stripe-webhook.controller.ts")).toMatch(/@SkipThrottle\(\)/);
  });

  it("ships a migration that removes direct anonymous and authenticated table access", () => {
    const sql = read("../prisma/migrations/20260820000200_harden_data_api/migration.sql");
    expect(sql).toMatch(/REVOKE ALL.*anon, authenticated/i);
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/i);
  });
});
