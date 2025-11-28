# Log Management System Documentation

## Overview

This project includes a comprehensive log management system using **Winston** for logging and **Logstash** for log aggregation. The system provides structured logging with multiple transports including console output, rotating file storage, and optional Logstash integration.

## Features

- **Structured JSON logging** with Winston
- **Daily log rotation** with configurable retention
- **Multiple log levels**: error, warn, info, debug
- **HTTP request/response logging** with timing
- **Logstash integration** for centralized log management
- **Separate error logging** for critical issues
- **Exception and rejection handlers**
- **Sensitive data sanitization** (passwords, tokens, etc.)

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Logging Configuration
LOG_LEVEL=debug                # Log level: error, warn, info, debug
LOG_DIR=logs                   # Directory for log files
LOGSTASH_ENABLED=false         # Enable/disable Logstash transport
LOGSTASH_HOST=localhost        # Logstash server hostname
LOGSTASH_PORT=5000             # Logstash server port
LOG_MAX_SIZE=20m               # Maximum log file size before rotation
LOG_MAX_FILES=14d              # Number of days to retain log files
```

### Log Levels

- **error**: Critical errors that need immediate attention
- **warn**: Warning messages for potentially harmful situations
- **info**: General informational messages (HTTP requests, etc.)
- **debug**: Detailed information for debugging

## Usage

### Basic Logging

```typescript
import logger from './utils/logger';

// Info log
logger.info('User login successful', { userId: 123 });

// Error log
logger.error('Database connection failed', { error });

// Warn log
logger.warn('API rate limit approaching', { remaining: 10 });

// Debug log
logger.debug('Cache hit', { key: 'user:123' });
```

### Using Helper Functions

```typescript
import { logError, logInfo, logWarn, logDebug } from './utils/logger';

// Simple logging
logInfo('Application started');

// With metadata
logError('Payment processing failed', error, { orderId: 456 });
```

### HTTP Request Logging

HTTP requests are automatically logged by the `httpLogger` middleware. No manual logging required for HTTP endpoints.

## Log Files

Logs are stored in the `logs/` directory with the following structure:

```
logs/
├── combined-2024-01-15.log      # All logs
├── error-2024-01-15.log         # Error logs only
├── exceptions-2024-01-15.log    # Uncaught exceptions
└── rejections-2024-01-15.log    # Unhandled promise rejections
```

Files are automatically rotated daily and compressed after rotation.

## Logstash Setup

### Local Development (Docker)

1. Start Logstash using Docker Compose:

```bash
docker-compose -f docker-compose.logstash.yaml up -d logstash
```

2. Enable Logstash in `.env`:

```bash
LOGSTASH_ENABLED=true
LOGSTASH_HOST=localhost
LOGSTASH_PORT=5000
```

3. Restart your application

4. View Logstash logs:

```bash
docker-compose -f docker-compose.logstash.yaml logs -f logstash
```

### Production Server Setup

1. Copy the setup script to your server:

```bash
scp scripts/setup-logstash.sh scripts/logstash.conf user@your-server:/tmp/
```

2. Run the setup script on your server:

```bash
ssh user@your-server
cd /tmp
sudo chmod +x setup-logstash.sh
sudo ./setup-logstash.sh
```

3. The script will:
   - Install Java (required for Logstash)
   - Install Logstash
   - Configure Logstash with the provided configuration
   - Start and enable the Logstash service
   - Configure firewall rules

4. Update your application's `.env`:

```bash
LOGSTASH_ENABLED=true
LOGSTASH_HOST=your-server-ip
LOGSTASH_PORT=5000
```

5. Verify Logstash is running:

```bash
ssh user@your-server
sudo systemctl status logstash
sudo journalctl -u logstash -f
```

### Logstash Configuration

The Logstash pipeline (`scripts/logstash.conf`) includes:

- **Input**: TCP listener on port 5000 for JSON logs
- **Filter**: 
  - Timestamp parsing
  - Log level categorization
  - HTTP request extraction
  - Error stack trace handling
- **Output**:
  - File output to `/var/log/logstash/`
  - Console output for debugging
  - Optional Elasticsearch integration

To customize, edit `scripts/logstash.conf` and restart Logstash:

```bash
sudo systemctl restart logstash
```

## With Elasticsearch and Kibana (Optional)

To enable full ELK stack for log visualization:

1. Uncomment Elasticsearch and Kibana in `docker-compose.logstash.yaml`

2. Uncomment Elasticsearch output in `scripts/logstash.conf`:

```conf
elasticsearch {
  hosts => ["http://localhost:9200"]
  index => "api-logs-%{+YYYY.MM.dd}"
}
```

3. Start all services:

```bash
docker-compose -f docker-compose.logstash.yaml up -d
```

4. Access Kibana at `http://localhost:5601`

5. Create an index pattern in Kibana: `api-logs-*`

## Troubleshooting

### Logs Not Appearing in Logstash

1. Check if Logstash is running:
   ```bash
   docker-compose -f docker-compose.logstash.yaml ps
   # or on server:
   sudo systemctl status logstash
   ```

2. Verify Logstash port is accessible:
   ```bash
   telnet localhost 5000
   ```

3. Check Logstash logs for errors:
   ```bash
   docker-compose -f docker-compose.logstash.yaml logs logstash
   # or on server:
   sudo journalctl -u logstash -f
```

### Application Not Connecting to Logstash

1. Verify `LOGSTASH_ENABLED=true` in `.env`

2. Check Logstash host and port settings

3. Review application logs for connection errors

4. Ensure firewall allows port 5000

### Log Files Growing Too Large

Adjust rotation settings in `.env`:

```bash
LOG_MAX_SIZE=10m    # Smaller file size
LOG_MAX_FILES=7d    # Fewer days retention
```

## Best Practices

1. **Use appropriate log levels**
   - `error`: For actual errors that need attention
   - `warn`: For concerning but non-critical issues
   - `info`: For normal operational messages
   - `debug`: For detailed troubleshooting (disable in production)

2. **Include context in logs**
   ```typescript
   logger.info('User action', {
     userId: user.id,
     action: 'purchase',
     amount: order.total,
     timestamp: new Date()
   });
   ```

3. **Don't log sensitive information**
   - Passwords, tokens, and API keys are automatically sanitized
   - Be cautious with PII (personally identifiable information)

4. **Monitor log volume**
   - Review log retention settings regularly
   - Consider log sampling for high-volume applications

5. **Set LOG_LEVEL based on environment**
   - Development: `debug`
   - Staging: `info`
   - Production: `warn` or `error`

## Performance Considerations

- Logging is asynchronous and non-blocking
- File rotation prevents disk space issues
- Logstash buffering handles temporary connection issues
- Consider log sampling for extremely high-traffic applications
