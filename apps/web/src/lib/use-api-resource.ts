import { useEffect, useState } from "react";
import { ApiError, apiGet } from "./api";

type ApiResource<T> =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; data: T };

/**
 * Loads a JSON resource from the API when `path` changes.
 * @param path - API path starting with `/api`, or null to skip loading
 * @returns the loading / error / success state of the request
 */
export function useApiResource<T>(path: string | null): ApiResource<T> {
  const [resource, setResource] = useState<ApiResource<T>>({ status: "loading" });

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    setResource({ status: "loading" });
    apiGet<T>(path)
      .then((data) => {
        if (!cancelled) setResource({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError({ status: 0, code: "network_error", message: "Could not reach the server." });
        setResource({ status: "error", error: apiError });
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return resource;
}
