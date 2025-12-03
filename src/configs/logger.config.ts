import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
// @ts-ignore
import LogstashTransport from 'winston-logstash';
import env from './env';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
    })
);
const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
        format: env.app.debug ? consoleFormat : logFormat,
    }),
];

// File transport for error logs
const errorFileTransport = new DailyRotateFile({
    filename: path.join(env.logging.dir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: env.logging.rotation.maxSize,
    maxFiles: env.logging.rotation.maxFiles,
    zippedArchive: true,
});

// File transport for all logs
const combinedFileTransport = new DailyRotateFile({
    filename: path.join(env.logging.dir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: env.logging.rotation.maxSize,
    maxFiles: env.logging.rotation.maxFiles,
    zippedArchive: true,
});
transports.push(errorFileTransport, combinedFileTransport);
if (env.logging.logstash.enabled) {
    try {
        const logstashTransport = new LogstashTransport({
            host: env.logging.logstash.host,
            port: env.logging.logstash.port,
            node_name: env.app.name,
            max_connect_retries: -1, // Infinite retries
        });

        transports.push(logstashTransport as any);
    } catch (error) {
        console.error('Failed to initialize Logstash transport:', error);
    }
}
const logger = winston.createLogger({
    level: env.logging.level,
    format: logFormat,
    defaultMeta: {
        service: env.app.name,
        environment: env.app.env,
    },
    transports,
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(env.logging.dir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: env.logging.rotation.maxSize,
            maxFiles: env.logging.rotation.maxFiles,
            format: logFormat,
        }),
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(env.logging.dir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: env.logging.rotation.maxSize,
            maxFiles: env.logging.rotation.maxFiles,
            format: logFormat,
        }),
    ],
});
import fs from 'fs';
if (!fs.existsSync(env.logging.dir)) {
    fs.mkdirSync(env.logging.dir, { recursive: true });
}

export default logger;
