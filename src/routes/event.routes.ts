import { Router } from "express";
import { createEvent, getEvents, searchEvents, getEventById, updateEvent, deleteEvent } from "../controllers/event.controller";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/search", searchEvents);
router.get("/:id", getEventById);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;