export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
export type ApiFetchOptions = { timeoutMs?: number };
export function apiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!value) throw new Error("NEXT_PUBLIC_API_URL is required");
  return value;
}
export async function apiFetch<T>(path: string, init?: RequestInit, options: ApiFetchOptions = {}): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (typeof init?.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const signal = init?.signal ?? (options.timeoutMs ? AbortSignal.timeout(options.timeoutMs) : undefined);
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    signal,
  });
  const body = await response.json().catch(() => null) as { code?: string; message?: string; details?: unknown } | null;
  if (!response.ok) throw new ApiError(response.status, body?.code ?? "API_ERROR", body?.message ?? "Commerce API request failed", body?.details);
  return body as T;
}
