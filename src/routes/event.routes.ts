import { Router } from "express";
import { createEvent, getEvents, searchEvents, getEventById, updateEvent, deleteEvent, getPopularEvents } from "../controllers/event.controller";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);

// 🛠️ STATIC ROUTES MUST GO FIRST
router.get("/search", searchEvents);
router.get("/popular", getPopularEvents);

// 🛠️ DYNAMIC ROUTES GO LAST
router.get("/:id", getEventById);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;