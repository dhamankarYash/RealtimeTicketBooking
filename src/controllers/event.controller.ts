import { Request, Response, NextFunction } from "express";
import * as eventService from "../services/event.service";

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const events = await eventService.getEvents(page, limit);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

export const searchEvents = async (req: Request, res:Response, next:NextFunction) => {
  try {

    const events = await eventService.searchEvents(req.query);

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.getEventById(req.params.id as string);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.updateEvent(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await eventService.deleteEvent(req.params.id as string);
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};