import 'dotenv/config'

export default {
	app: {
		name: process.env.APP_NAME || "Hexagonal_Architecture",
		env: process.env.APP_ENV || "local",
		debug: process.env.APP_DEBUG || true,
		key:
			process.env.APP_KEY ||
			"base64:NXBteWZhcDZidzJtZGJsZ2pmeXRtZ2J3OTdseXBzNXg=",
	},
	adapter: {
		postgres: {
			url: process.env.ADAPTER_PRISMA_POSTGRES_URL || "postgresql://user:password@localhost:5432/mydb",
			optimizeKey: process.env.ADAPTER_PRISMA_OPTIMIZE_API_KEY || "",
		},
		azure: {
			openaiApiKey: process.env.ADAPTER_AZURE_OPENAI_API_KEY || "",
			openaiApiEndpoint:
				process.env.ADAPTER_AZURE_OPENAI_API_ENDPOINT || "",
			storageConnectionString:
				process.env.ADAPTER_AZURE_STORAGE_CONNECTION_STRING || "",
			storageContainerName:
				process.env.ADAPTER_AZURE_STORAGE_CONTAINER_NAME || "",
		},
		midtrans: {
			serverKey: process.env.ADAPTER_MIDTRANS_SERVER_KEY || "",
			clientKey: process.env.ADAPTER_MIDTRANS_CLIENT_KEY || "",
			merchantId: process.env.ADAPTER_MIDTRANS_MERCHANT_ID || "",
			isProduction:
				process.env.ADAPTER_MIDTRANS_IS_PRODUCTION || false,
		},
		redis: {
			host: process.env.ADAPTER_REDIS_HOST || "localhost",
			port: process.env.ADAPTER_REDIS_PORT || 6379,
			password: process.env.ADAPTER_REDIS_PASSWORD || "password",
		},
		rag: {
			endpoint: process.env.ADAPTER_RAG_ENDPOINT || "",
		},
	},
	transport: {
		http: {
			port: process.env.TRANSPORT_HTTP_PORT || 8080,
		},
		kafka: {
			broker: process.env.TRANSPORT_KAFKA_BROKER || "localhost:9092",
		},
	},
	logging: {
		level: process.env.LOG_LEVEL || "debug",
		dir: process.env.LOG_DIR || "logs",
		logstash: {
			enabled: process.env.LOGSTASH_ENABLED === "true" || false,
			host: process.env.LOGSTASH_HOST || "localhost",
			port: parseInt(process.env.LOGSTASH_PORT || "5000", 10),
		},
		rotation: {
			maxSize: process.env.LOG_MAX_SIZE || "20m",
			maxFiles: process.env.LOG_MAX_FILES || "14d",
		},
	},
	cache: {
		ttl: process.env.CACHE_TTL || 3600,
	},
	rateLimit: {
		max: process.env.RATE_LIMIT_MAX || 100,
		duration: process.env.RATE_LIMIT_DURATION || 60,
	},
};