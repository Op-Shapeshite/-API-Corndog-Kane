// Type declarations for third-party modules without @types packages

declare module 'winston-logstash' {
    import { TransportStreamOptions } from 'winston-transport';

    interface LogstashTransportOptions extends Partial<TransportStreamOptions> {
        host: string;
        port: number;
        node_name?: string;
        max_connect_retries?: number;
        timeout_connect_retries?: number;
        ssl_enable?: boolean;
        ssl_key?: string;
        ssl_cert?: string;
        ca?: string;
    }

    class LogstashTransport {
        constructor(options: LogstashTransportOptions);
    }

    export = LogstashTransport;
}
