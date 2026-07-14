import Cookies from "js-cookie";
import { TOKEN_COOKIE } from "./constants";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/**
 * The token lives in a cookie, not localStorage, because `proxy.ts` (Next's
 * edge middleware) has to read it to short-circuit the redirect for signed-out
 * users. Edge middleware cannot see localStorage.
 *
 * The cookie is readable by JS — it is not an httpOnly session cookie. The
 * backend is a stateless JWT API that treats every request as untrusted, so the
 * cookie is a transport detail, not the security boundary.
 */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_COOKIE, token, {
    // Days. The JWT itself expires in 8h, so this is only an upper bound.
    expires: 1,
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });
}

export function clearToken(): void {
  Cookies.remove(TOKEN_COOKIE);
}

export interface FieldError {
  field: string;
  message: string;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: FieldError[]
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/** The backend's envelope. Every JSON response is one of these two shapes. */
interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string; details?: FieldError[] };
}

/**
 * auth-context registers a handler so that a 401 on an authenticated request
 * performs exactly ONE global logout. This is a callback rather than an import
 * to avoid a cycle between the api layer and the auth context.
 */
let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const hadToken = token !== undefined;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiClientError(
      0,
      `Cannot reach the API at ${BASE_URL}. Is the backend running?`
    );
  }

  // 204 No Content: the delete endpoints on drivers, maintenance and expenses
  // send an empty body. Parsing that as JSON would throw.
  if (response.status === 204) {
    return undefined as T;
  }

  let envelope: Envelope<T> | null = null;
  try {
    envelope = (await response.json()) as Envelope<T>;
  } catch {
    // Non-JSON body; falls through to the error path below.
  }

  if (!response.ok || !envelope?.success) {
    // A 401 WITH a token means the session died -> log out globally.
    // A 401 WITHOUT a token (a wrong password on the login form) is just a
    // failed request, and must not trigger a redirect.
    if (response.status === 401 && hadToken) {
      onUnauthorized?.();
    }
    throw new ApiClientError(
      response.status,
      envelope?.error?.message ?? `Request failed (${response.status})`,
      envelope?.error?.details
    );
  }

  return envelope.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Builds `?a=1&b=2` from the defined, non-empty entries of a filter object. */
export function buildQuery(
  params: Record<string, string | undefined>
): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] =>
      entry[1] !== undefined && entry[1] !== ""
  );
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
}

/**
 * Authenticated file download, used for the analytics CSV export. That endpoint
 * returns `text/csv` instead of the JSON envelope, so it bypasses `request`.
 */
export async function downloadFile(
  path: string,
  filename: string
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    throw new ApiClientError(response.status, "Download failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
