import { validateEnv } from "./env.js";

describe("environment validation", () => {
  it("accepts a valid commerce API environment", () => {
    const env = validateEnv({
      DATABASE_URL: "postgresql://shop:secret@localhost:5432/shopco",
      PORT: "4100",
      FRONTEND_URL: "https://shop.example.com",
      NODE_ENV: "test",
    });

    expect(env.PORT).toBe(4100);
    expect(env.NODE_ENV).toBe("test");
  });

  it("fails fast when DATABASE_URL is missing", () => {
    expect(() => validateEnv({ NODE_ENV: "test" })).toThrow("DATABASE_URL");
  });

  it("fails fast when FRONTEND_URL is missing", () => {
    expect(() => validateEnv({ DATABASE_URL: "postgresql://localhost/shop", NODE_ENV: "test" })).toThrow("FRONTEND_URL");
  });

  it("normalizes FRONTEND_URL to an origin for reliable CORS comparison", () => {
    const env = validateEnv({
      DATABASE_URL: "postgresql://shop:secret@localhost:5432/shopco",
      FRONTEND_URL: "https://shop.example.com/",
      NODE_ENV: "test",
    });
    expect(env.FRONTEND_URL).toBe("https://shop.example.com");
  });

  it("rejects a non-PostgreSQL DATABASE_URL", () => {
    expect(() =>
      validateEnv({ DATABASE_URL: "mysql://localhost/shop", NODE_ENV: "test" }),
    ).toThrow("PostgreSQL");
  });

  it("parses an exact comma-separated production origin allowlist", () => {
    const env = validateEnv({
      DATABASE_URL: "postgresql://localhost/shop",
      FRONTEND_URLS: "https://shop.example.com, https://preview.example.com/path",
      NODE_ENV: "production",
    });
    expect(env.FRONTEND_URLS).toEqual([
      "https://shop.example.com",
      "https://preview.example.com",
    ]);
  });

  it("rejects wildcard origins", () => {
    expect(() => validateEnv({
      DATABASE_URL: "postgresql://localhost/shop",
      FRONTEND_URLS: "https://*.vercel.app",
      NODE_ENV: "production",
    })).toThrow("wildcard");
  });
});
