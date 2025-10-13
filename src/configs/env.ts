import 'dotenv'


export default {
  app: {
    name: process.env.APP_NAME || 'Hexagonal_Architecture',
    env: process.env.APP_ENV || 'local',
    debug: process.env.APP_DEBUG || true,
    key: process.env.APP_KEY || 'base64:NXBteWZhcDZidzJtZGJsZ2pmeXRtZ2J3OTdseXBzNXg='
  },
  adapter: {
      postgres: {
        db: process.env.ADAPTER_POSTGRES_DB || 'splaceservice',
        user: process.env.ADAPTER_POSTGRES_USER || 'user',
        password: process.env.ADAPTER_POSTGRES_PASSWORD || 'password',
        host: process.env.ADAPTER_POSTGRES_HOST || 'localhost',
        port: process.env.ADAPTER_POSTGRES_PORT || 5432,
        hostTenant: process.env.ADAPTER_POSTGRES_HOST_TENANT || 'localhost',
        portTenant: process.env.ADAPTER_POSTGRES_PORT_TENANT || 5432
      },
      azure: {
        openaiApiKey: process.env.ADAPTER_AZURE_OPENAI_API_KEY || '',
        openaiApiEndpoint: process.env.ADAPTER_AZURE_OPENAI_API_ENDPOINT || '',
        storageConnectionString: process.env.ADAPTER_AZURE_STORAGE_CONNECTION_STRING || '',
        storageContainerName: process.env.ADAPTER_AZURE_STORAGE_CONTAINER_NAME || ''
      },
      midtrans: {
        serverKey: process.env.ADAPTER_MIDTRANS_SERVER_KEY || '',
        clientKey: process.env.ADAPTER_MIDTRANS_CLIENT_KEY || '',
        merchantId: process.env.ADAPTER_MIDTRANS_MERCHANT_ID || '',
        isProduction: process.env.ADAPTER_MIDTRANS_IS_PRODUCTION || false
      },
      redis: {
        host: process.env.ADAPTER_REDIS_HOST || 'localhost',
        port: process.env.ADAPTER_REDIS_PORT || 6379,
        password: process.env.ADAPTER_REDIS_PASSWORD || 'password'
      },
      rag: {
        endpoint: process.env.ADAPTER_RAG_ENDPOINT || ''
      }
  },
  transport: {
    http: {
      port: process.env.TRANSPORT_HTTP_PORT || 8080
    },
    kafka: {
      broker: process.env.TRANSPORT_KAFKA_BROKER || 'localhost:9092'
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug'
  },
  cache: {
    ttl: process.env.CACHE_TTL || 3600
  },
  rateLimit: {
    max: process.env.RATE_LIMIT_MAX || 100,
    duration: process.env.RATE_LIMIT_DURATION || 60
  }
}