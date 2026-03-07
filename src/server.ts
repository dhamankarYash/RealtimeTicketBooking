import express from "express";
import dotenv from "dotenv";
import { prisma } from "./config/prisma";
import eventRoutes from "./routes/event.routes";
import bookingroutes from "./routes/booking.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import { startBookingExpiryJob } from "./jobs/bookingExpiry.job";
import { connectRedis } from "./config/redis"; 
import { apiLimiter } from "./middleware/rateLimit.middleware";

dotenv.config();

const app = express();

// 1. Parse incoming JSON payloads
app.use(express.json());

// 2. 🛡️ Global Rate Limiter: Protects ALL routes below this line
app.use(apiLimiter);

// 3. API Routes
app.use("/events", eventRoutes);
app.use("/bookings", bookingroutes);
app.use("/auth", authRoutes);

// 4. Utility / Health Check Routes
app.get("/db-check", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 5. Global Error Handler (Must be the last middleware!)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize background connections and jobs
connectRedis();
startBookingExpiryJob();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});