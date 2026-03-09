import { Router, Request, Response } from "express";
import redisClient from "../config/redis";

const router = Router();

// 1. Basic Health Check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime()
  });
});

// 2. Redis Status Check
router.get("/redis/status", async (req: Request, res: Response) => {
  try {
    const pong = await redisClient.ping();
    res.status(200).json({
      success: true,
      redis: pong // Expected: "PONG"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Redis is down", error: error.message });
  }
});

// 3. System Info Check
router.get("/info", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    node: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage()
  });
});

export default router;