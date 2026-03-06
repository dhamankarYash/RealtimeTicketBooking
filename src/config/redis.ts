import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://localhost:6379"
});

// FIX: Added ': any' to the err parameter
redisClient.on("error", (err: any) => {
  console.log("Redis Error:", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected");
};

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();