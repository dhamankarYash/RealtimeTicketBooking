import { Router } from "express";
import { createBooking, confirmBooking, getBookings, getBookingById, cancelBooking } from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Protect ALL booking routes
router.use(authMiddleware);

router.get("/", getBookings);
router.get("/:id", getBookingById);
router.post("/:eventId", createBooking);
router.post("/:bookingId/confirm", confirmBooking);
router.delete("/:id", cancelBooking);

export default router;