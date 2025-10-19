import { PrismaClient } from "@prisma/client";
// import { withOptimize } from "@prisma/extension-optimize";
import env from "../../configs/env";


export default class  PostgresAdapter { 

  public static client: PrismaClient;

  static boot() {
    const postgresClient = new PrismaClient({datasourceUrl: env.adapter.postgres.url})
    console.log('[Postgres Adapter] Connected to Postgres');
    PostgresAdapter.client = postgresClient;
  }

}


