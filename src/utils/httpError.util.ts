export class HttpError<T = null> extends Error {
  public statusCode: number;
  public details: T;

  constructor(statusCode: number, message: string, details: T = null as T) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
