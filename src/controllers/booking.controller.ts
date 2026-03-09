import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/booking.service";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.eventId as string;
    
    // 🛠️ FIX 1: Grab the real userId from the decoded JWT!
    const userId = req.user.userId; 

    if (!eventId) {
      return res.status(400).json({ success: false, message: "Invalid eventId" });
    }

    const { seatNumber } = req.body;

    const booking = await bookingService.createBooking(
      eventId,
      Number(seatNumber),
      userId // 🛠️ FIX 2: Pass the real userId to the service
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

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingService.getBookings();
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id as string);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await bookingService.cancelBooking(req.params.id as string);
    res.status(200).json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    next(error);
  }
};