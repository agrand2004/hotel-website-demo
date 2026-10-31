import { ApiError } from "./api-error";

export { ApiError } from "./api-error";

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: body?.error?.code ?? "unknown_error",
      message: body?.error?.message ?? "Something went wrong. Please try again.",
    });
  }
  return body as T;
}

/**
 * GETs a JSON resource from the API.
 * @param path - path starting with `/api`
 * @returns the parsed response body
 * @throws {ApiError} on a non-2xx response
 */
export async function apiGet<T>(path: string): Promise<T> {
  return parseResponse<T>(await fetch(path));
}

/**
 * POSTs a JSON body to the API.
 * @param path - path starting with `/api`
 * @param body - JSON-serialisable payload, omitted when undefined
 * @returns the parsed response body
 * @throws {ApiError} on a non-2xx response
 */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parseResponse<T>(response);
}
