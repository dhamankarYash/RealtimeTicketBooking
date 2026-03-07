import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/booking.service";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 🛠️ FIX: Explicitly tell TypeScript this is a guaranteed string
    const eventId = req.params.eventId as string;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventId",
      });
    }

    const { seatNumber } = req.body;

    const booking = await bookingService.createBooking(
      eventId,
      Number(seatNumber) // 🛠️ FIX: Guarantee this is a number
    );

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // 🛠️ FIX: Explicitly tell TypeScript this is a guaranteed string
    const bookingId = req.params.bookingId as string;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid bookingId",
      });
    }

    const booking = await bookingService.confirmBooking(bookingId);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};