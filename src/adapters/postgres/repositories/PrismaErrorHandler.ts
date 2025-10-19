import { Prisma } from "@prisma/client";
import { TErrorResponse } from "../../../core/entities/base/response";

/**
 * Prisma Error Handler
 * Converts Prisma errors to standardized error responses
 */
export class PrismaErrorHandler {
  /**
   * Check if error is a Prisma error and handle it
   */
  static handlePrismaError(error: unknown): { errors: TErrorResponse[]; statusCode: number } | null {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(error);
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      return this.handleValidationError(error);
    }
    
    return null; // Not a Prisma error
  }

  /**
   * Handle known Prisma request errors (P2xxx codes)
   */
  private static handleKnownRequestError(error: Prisma.PrismaClientKnownRequestError): { errors: TErrorResponse[]; statusCode: number } {
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        return this.handleUniqueConstraintError(error);
      
      case 'P2025': // Record not found
        return {
          errors: [{
            field: 'id',
            message: 'Record not found',
            type: 'not_found'
          }],
          statusCode: 404
        };
      
      case 'P2003': // Foreign key constraint failed
        return this.handleForeignKeyError(error);
      
      case 'P2014': // Required relation violation
        return {
          errors: [{
            field: 'relation',
            message: 'Required relation is missing',
            type: 'required'
          }],
          statusCode: 400
        };
      
      default:
        return {
          errors: [{
            field: 'database',
            message: `Database error: ${error.message}`,
            type: 'internal_error'
          }],
          statusCode: 500
        };
    }
  }

  /**
   * Handle unique constraint violations (P2002)
   */
  private static handleUniqueConstraintError(error: Prisma.PrismaClientKnownRequestError): { errors: TErrorResponse[]; statusCode: number } {
    const meta = error.meta as { target?: string[] };
    const fields = meta?.target || ['field'];
    
    const errors: TErrorResponse[] = fields.map(field => ({
      field,
      message: `${field} already exists`,
      type: 'unique_constraint'
    }));

    return {
      errors,
      statusCode: 409 // Conflict
    };
  }

  /**
   * Handle foreign key constraint errors (P2003)
   */
  private static handleForeignKeyError(error: Prisma.PrismaClientKnownRequestError): { errors: TErrorResponse[]; statusCode: number } {
    const meta = error.meta as { field_name?: string };
    const field = meta?.field_name || 'foreign_key';
    
    return {
      errors: [{
        field,
        message: `Invalid reference: ${field} does not exist`,
        type: 'invalid'
      }],
      statusCode: 400
    };
  }

  /**
   * Handle validation errors
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static handleValidationError(_error: Prisma.PrismaClientValidationError): { errors: TErrorResponse[]; statusCode: number } {
    return {
      errors: [{
        field: 'validation',
        message: 'Invalid data provided',
        type: 'invalid'
      }],
      statusCode: 400
    };
  }
}
