import logger from '../configs/logger.config';

// Export the configured logger instance
export default logger;

// Export convenience methods
export const logInfo = (message: string, metadata?: object) => {
    logger.info(message, metadata);
};

export const logError = (message: string, error?: Error | unknown, metadata?: object) => {
    const errorMeta = error instanceof Error ? {
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
        },
        ...metadata,
    } : { error, ...metadata };

    logger.error(message, errorMeta);
};

export const logWarn = (message: string, metadata?: object) => {
    logger.warn(message, metadata);
};

export const logDebug = (message: string, metadata?: object) => {
    logger.debug(message, metadata);
};

// HTTP request logging helper
export const logHttpRequest = (req: any) => {
    logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.method !== 'GET' ? req.body : undefined,
    });
};

// HTTP response logging helper
export const logHttpResponse = (req: any, res: any, responseTime: number) => {
    logger.info('HTTP Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
    });
};
