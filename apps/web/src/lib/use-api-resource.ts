import { useEffect, useState } from "react";
import { ApiError, apiGet } from "./api";

type ApiResource<T> =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; data: T };

/**
 * Loads a resource through the local demo adapter when `path` changes.
 * @param path - API path starting with `/api`, or null to skip loading
 * @returns the loading / error / success state of the request
 */
export function useApiResource<T>(path: string | null): ApiResource<T> {
  const [result, setResult] = useState<{ path: string | null; resource: ApiResource<T> }>({
    path: null, resource: { status: "loading" },
  });

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    setResult({ path, resource: { status: "loading" } });
    apiGet<T>(path)
      .then((data) => {
        if (!cancelled) setResult({ path, resource: { status: "success", data } });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError({ status: 0, code: "demo_error", message: "Could not load this demo. Please try again." });
        setResult({ path, resource: { status: "error", error: apiError } });
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return result.path === path ? result.resource : { status: "loading" };
}
