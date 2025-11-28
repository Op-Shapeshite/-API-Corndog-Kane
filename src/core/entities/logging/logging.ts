export type TLogLevel = 'error' | 'warn' | 'info' | 'debug';

export type TLogEntry = {
    timestamp: string;
    level: TLogLevel;
    message: string;
    service: string;
    environment: string;
    metadata?: Record<string, any>;
    error?: {
        message: string;
        stack?: string;
        name: string;
    };
};

export type THttpLogEntry = TLogEntry & {
    method: string;
    url: string;
    statusCode?: number;
    responseTime?: string;
    ip?: string;
    userAgent?: string;
};

export type TLogstashConfig = {
    enabled: boolean;
    host: string;
    port: number;
};

export type TLogRotationConfig = {
    maxSize: string;
    maxFiles: string;
};

export type TLoggingConfig = {
    level: TLogLevel;
    dir: string;
    logstash: TLogstashConfig;
    rotation: TLogRotationConfig;
};
