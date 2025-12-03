import { Request, Response, NextFunction } from 'express';
import logger from '../../../utils/logger';

/**
 * HTTP request/response logging middleware using Winston
 * Replaces Morgan with structured logging
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log request
    logger.info('Incoming Request', {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        // Only log body for non-GET requests and exclude sensitive data
        body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    });

    // Capture response
    const originalSend = res.send;
    res.send = function (data): Response {
        res.send = originalSend; // Restore original send
        const responseTime = Date.now() - startTime;

        // Log response
        const level = res.statusCode >= 400 ? 'warn' : 'info';
        logger.log(level, 'Outgoing Response', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            contentLength: res.get('content-length'),
        });

        return originalSend.call(this, data);
    };

    next();
};

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
        return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '***REDACTED***';
        }
    }

    return sanitized;
}
