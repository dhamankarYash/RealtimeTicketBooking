import {Request,Response,NextFunction} from "express";
import * as bookingService from "../services/booking.service";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.eventId;

    if (!eventId || Array.isArray(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventId",
      });
    }

    const { seatNumber } = req.body;

    const booking = await bookingService.createBooking(
      eventId,
      seatNumber
    );

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};