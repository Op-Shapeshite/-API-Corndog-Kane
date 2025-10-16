import { PrismaClient } from "@prisma/client";
import { withOptimize } from "@prisma/extension-optimize";


export default class  PostgresAdapter { 

  public static client: unknown;

  static boot() {
    const postgresClient = new PrismaClient().$extends(
      withOptimize({
        apiKey: process.env.ADAPTER_PRISMA_OPTIMIZE_API_KEY || '',
      })
    );
    console.log('[Postgres Adapter] Connected to Postgres');
    PostgresAdapter.client = postgresClient;
  }

}


