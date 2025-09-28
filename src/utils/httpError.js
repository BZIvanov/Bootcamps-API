export class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
