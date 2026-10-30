import { HTTPException } from "hono/http-exception";

/**
 * Builds an HTTP error whose JSON body is `{ error: { code, message } }`.
 * @param params.status - HTTP status code
 * @param params.code - lower_snake_case machine-readable code
 * @param params.message - human-readable message
 * @returns the exception to throw
 */
export function httpError(params: { status: 400 | 404 | 409; code: string; message: string }) {
  const body = JSON.stringify({ error: { code: params.code, message: params.message } });
  return new HTTPException(params.status, {
    res: new Response(body, {
      status: params.status,
      headers: { "Content-Type": "application/json" },
    }),
  });
}
