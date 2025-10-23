import { ErrorHandler, ErrorResponse } from "./ErrorHandler";

/**
 * Handles all other errors (catch-all)
 */
export class GenericErrorHandler extends ErrorHandler {
  handle(error: unknown): ErrorResponse {
    console.error('Unhandled error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      errors: [{
        field: 'server',
        message: errorMessage,
        type: 'internal_error'
      }],
      message: 'Internal server error',
      statusCode: 500
    };
  }
}
