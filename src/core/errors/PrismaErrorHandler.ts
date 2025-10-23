import { Prisma } from "@prisma/client";
import { ErrorHandler, ErrorResponse } from "./ErrorHandler";

/**
 * Handles Prisma-specific errors
 */
export class PrismaErrorHandler extends ErrorHandler {
  handle(error: unknown): ErrorResponse | null {
    if (this.isPrismaError(error)) {
      return this.handlePrismaError(error);
    }
    return this.passToNext(error);
  }

  private isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): ErrorResponse {
    switch (error.code) {
      case 'P2002':
        return {
          errors: [{
            field: this.extractFieldFromMeta(error.meta),
            message: 'A record with this value already exists',
            type: 'duplicate'
          }],
          message: 'Duplicate entry',
          statusCode: 409
        };

      case 'P2025':
        return {
          errors: [{
            field: 'id',
            message: 'Record not found',
            type: 'not_found'
          }],
          message: 'Record not found',
          statusCode: 404
        };

      case 'P2003':
        return {
          errors: [{
            field: this.extractFieldFromMeta(error.meta),
            message: 'Foreign key constraint failed',
            type: 'foreign_key'
          }],
          message: 'Related record not found',
          statusCode: 400
        };

      case 'P2014':
        return {
          errors: [{
            field: 'relation',
            message: 'The change would violate a relation constraint',
            type: 'relation_violation'
          }],
          message: 'Relation constraint violation',
          statusCode: 400
        };

      default:
        return {
          errors: [{
            field: 'database',
            message: error.message,
            type: 'database_error'
          }],
          message: 'Database error',
          statusCode: 500
        };
    }
  }

  private extractFieldFromMeta(meta?: Record<string, unknown>): string {
    if (meta && meta.target && Array.isArray(meta.target)) {
      return meta.target[0] as string;
    }
    return 'unknown';
  }
}
