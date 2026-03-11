import { Router } from "express";
import { createBooking, confirmBooking, getBookings, getBookingById, cancelBooking, getBookingStats } from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getBookings);

// 🛠️ STATIC ROUTES MUST GO FIRST
router.get("/stats", getBookingStats);

// 🛠️ DYNAMIC ROUTES GO LAST
router.get("/:id", getBookingById);
router.post("/:eventId", createBooking);
router.post("/:bookingId/confirm", confirmBooking);
router.delete("/:id", cancelBooking);

export default router;