import { ErrorHandler, ErrorResponse } from "./ErrorHandler";
import { TErrorResponse } from "../entities/base/response";

/**
 * Custom application error
 */
export class ApplicationError extends Error {
  constructor(
    message: string,
    public field: string = 'general',
    public type: TErrorResponse['type'] = 'application_error',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

/**
 * Handles custom application errors
 */
export class ApplicationErrorHandler extends ErrorHandler {
  handle(error: unknown): ErrorResponse | null {
    if (error instanceof ApplicationError) {
      return {
        errors: [{
          field: error.field,
          message: error.message,
          type: error.type
        }],
        message: error.message,
        statusCode: error.statusCode
      };
    }
    return this.passToNext(error);
  }
}
