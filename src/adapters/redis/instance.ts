import { createClient } from "redis";


export default class  RedisAdapter { 

  public static client = createClient();

  static boot() {
    const redisClient = createClient({ url: "redis://localhost:6379" });
    console.log('[Redis Adapter] Connected to Redis');
    RedisAdapter.client = redisClient;
  }

}


