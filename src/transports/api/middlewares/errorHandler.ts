import { Request, Response, NextFunction } from 'express';
import { PrismaErrorHandler } from '../../../adapters/postgres/repositories/PrismaErrorHandler';
import { TErrorResponse } from '../../../core/entities/base/response';

/**
 * Global error handler middleware
 * Ensures all errors are returned in consistent JSON format
 */
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error for debugging
  console.error('[Error Handler]:', error);
  if (res.headersSent) {
    return next(error);
  }
  const prismaError = PrismaErrorHandler.handlePrismaError(error);
  if (prismaError) {
    res.status(prismaError.statusCode).json({
      status: 'failed',
      message: prismaError.errors[0]?.message || 'Operasi database gagal',
      data: null,
      errors: prismaError.errors,
      metadata: {},
    });
    return;
  }
  if (error instanceof Error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    
    const errors: TErrorResponse[] = [{
      field: 'validation',
      message: error.message,
      type: error.message.includes('not found') ? 'not_found' : 'invalid',
    }];

    res.status(statusCode).json({
      status: 'failed',
      message: error.message,
      data: null,
      errors,
      metadata: {},
    });
    return;
  }
  res.status(500).json({
    status: 'failed',
    message: 'Terjadi kesalahan server internal',
    data: null,
    errors: [{
      field: 'server',
      message: 'Terjadi kesalahan yang tidak terduga',
      type: 'internal_error',
    }],
    metadata: {},
  });
};
