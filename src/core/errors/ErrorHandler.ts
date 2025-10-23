import { TErrorResponse } from "../entities/base/response";

/**
 * Error response structure
 */
export interface ErrorResponse {
  errors: TErrorResponse[];
  message: string;
  statusCode: number;
}

/**
 * Chain of Responsibility Pattern: Base Error Handler
 * Each handler decides if it can handle the error or pass to next handler
 */
export abstract class ErrorHandler {
  protected next?: ErrorHandler;

  /**
   * Set the next handler in the chain
   */
  setNext(handler: ErrorHandler): ErrorHandler {
    this.next = handler;
    return handler;
  }

  /**
   * Handle the error or pass to next handler
   */
  abstract handle(error: unknown): ErrorResponse | null;

  /**
   * Pass error to next handler in chain
   */
  protected passToNext(error: unknown): ErrorResponse | null {
    if (this.next) {
      return this.next.handle(error);
    }
    return null;
  }
}
