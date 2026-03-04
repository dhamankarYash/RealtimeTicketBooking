import { prisma } from "../config/prisma";

export const createBooking = async (
  eventId: string,
  seatNumber: number
) => {
  try {
    // 1️⃣ Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // 2️⃣ Validate seat number
    if (seatNumber < 1 || seatNumber > event.totalSeats) {
      throw new Error("Invalid seat number");
    }

    // 3️⃣ Try booking with 5-minute expiration lock
    const userId = "ab43f432-12c7-4a46-8343-ccab091bdc7e"; // temp user
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // Current time + 5 minutes

    return await prisma.booking.create({
      data: {
        eventId,
        seatNumber,
        userId,
        expiresAt: expiryTime
      },
    });

  } catch (error: any) {
    // 4️⃣ Handle duplicate booking
    if (error.code === "P2002") {
      throw new Error("Seat already booked");
    }

    throw error;
  }
};

export const confirmBooking = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status === "CONFIRMED") {
    throw new Error("Booking already confirmed");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED"
    }
  });
};