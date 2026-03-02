import { prisma } from "../config/prisma";



export const createBooking = async (
  eventId: string,
  seatNumber: number
) => {
  try {
    return await prisma.booking.create({
      data: {
        eventId,
        seatNumber,
        userId: "ab43f432-12c7-4a46-8343-ccab091bdc7e", // will replace after auth
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Seat already booked");
    }
    throw error;
  }
};