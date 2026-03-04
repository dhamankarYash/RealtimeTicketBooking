import {Router} from "express"
import {createBooking,confirmBooking} from "../controllers/booking.controller";
import { Request } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}
const router = Router();

router.post("/:eventId",createBooking);
router.post("/:bookingId/confirm", confirmBooking);

router.post("/:eventId", authMiddleware, createBooking);
router.post("/:bookingId/confirm", authMiddleware, confirmBooking);
export default router;