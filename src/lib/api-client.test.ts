import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiFetch } from "./api/client.ts";

const originalFetch = globalThis.fetch;
const originalUrl = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalUrl;
});

describe("commerce API client", () => {
  it("keeps GET requests CORS-simple by omitting JSON content type when there is no body", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.shop.test";
    let captured: RequestInit | undefined;
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      void input;
      captured = init;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    await apiFetch<{ ok: boolean }>("/products");

    const headers = new Headers(captured?.headers);
    assert.equal(headers.get("accept"), "application/json");
    assert.equal(headers.has("content-type"), false);
  });

  it("sets JSON content type for requests that carry a body", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.shop.test";
    let captured: RequestInit | undefined;
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      void input;
      captured = init;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    await apiFetch<{ ok: boolean }>("/orders", { method: "POST", body: "{}" });

    const headers = new Headers(captured?.headers);
    assert.equal(headers.get("content-type"), "application/json");
  });
});
