/** Shared error shape for the web data adapter. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(params: { status: number; code: string; message: string }) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
  }
}
