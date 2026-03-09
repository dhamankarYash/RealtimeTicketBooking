import { prisma } from "../config/prisma";
import redisClient from "../config/redis"; // 🛠️ Import Redis!

export const createBooking = async (
  eventId: string,
  seatNumber: number,
  userId: string // 🛠️ FIX 3: Accept the real userId here
) => {
  // 1️⃣ Validate Event & Seat
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) throw new Error("Event not found");
  if (seatNumber < 1 || seatNumber > event.totalSeats) {
    throw new Error("Invalid seat number");
  }

  // 2️⃣ THE REDIS DISTRIBUTED LOCK
  const lockKey = `seat:${eventId}:${seatNumber}`;
  
  const acquiredLock = await redisClient.set(lockKey, "locked", {
    NX: true,
    EX: 300 
  });

  if (!acquiredLock) {
    throw new Error("Seat already reserved");
  }

  try {
    // 3️⃣ Try Database Booking
    // 🛠️ FIX 4: Deleted the fake "temp user" variable!
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); 

    return await prisma.booking.create({
      data: {
        eventId,
        seatNumber,
        userId, // 🛠️ Uses the real ID passed into the function
        expiresAt: expiryTime
      },
    });

  } catch (error: any) {
    // 4️⃣ Cleanup: If DB fails, release the Redis lock!
    await redisClient.del(lockKey);

    if (error.code === "P2002") {
      throw new Error("Seat already booked in database");
    }

    throw error;
  }
};

export const confirmBooking = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CONFIRMED") throw new Error("Booking already confirmed");

  const confirmedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" }
  });

  // 5️⃣ Release the lock completely once paid/confirmed
  const lockKey = `seat:${booking.eventId}:${booking.seatNumber}`;
  await redisClient.del(lockKey);

  return confirmedBooking;
};

export const getBookings = async () => {
  return prisma.booking.findMany({
    include: { event: true } // Joins the Event data automatically!
  });
};

export const getBookingById = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { event: true }
  });
  if (!booking) throw new Error("Booking not found");
  return booking;
};

export const cancelBooking = async (id: string) => {
  return prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" }
  });
};