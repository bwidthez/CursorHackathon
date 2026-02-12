import { config } from "@/lib/config";

/**
 * Thin HTTP client wrapper around fetch, pointing at your separate backend API.
 *
 * Your teammates can plug in real endpoints here later (auth headers, error handling, etc.).
 */

const BASE_URL = config.api.baseUrl;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  /**
   * Arbitrary per-request metadata your backend team might care about later.
   */
  meta?: Record<string, unknown>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Placeholder error handling ? your teammates can replace this with something richer.
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API request to ${url} failed (${res.status}): ${text}`);
  }

  if (res.status === 204) {
    // No content
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

