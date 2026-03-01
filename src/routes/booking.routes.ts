import {Router} from "express"
import {createBooking} from "../controllers/booking.controller";

const router = Router();

router.post("/:eventId",createBooking);

export default router;