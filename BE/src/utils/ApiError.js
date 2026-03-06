class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    // This captures the stack trace (where the error happened)
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = { ApiError };