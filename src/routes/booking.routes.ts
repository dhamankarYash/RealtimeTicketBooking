import { Router } from "express";
import { createBooking, confirmBooking } from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// 🔒 Protected routes: Users MUST be logged in (authMiddleware) to hit these
router.post("/:eventId", authMiddleware, createBooking);
router.post("/:bookingId/confirm", authMiddleware, confirmBooking);




export default router;