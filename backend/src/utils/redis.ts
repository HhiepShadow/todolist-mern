import * as redis from "redis";

const redisClient = redis.createClient({
  url: "redis://localhost:6379",
});

export default redisClient;
