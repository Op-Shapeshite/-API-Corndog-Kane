import { ZodError, ZodIssue } from "zod";
import { ErrorHandler, ErrorResponse } from "./ErrorHandler";

/**
 * Handles Zod validation errors
 */
export class ValidationErrorHandler extends ErrorHandler {
  handle(error: unknown): ErrorResponse | null {
    if (error instanceof ZodError) {
      return this.handleZodError(error);
    }
    return this.passToNext(error);
  }

  private handleZodError(error: ZodError): ErrorResponse {
    const errors = error.issues.map((err: ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
      type: 'validation' as const
    }));

    return {
      errors,
      message: 'Validation failed',
      statusCode: 400
    };
  }
}
