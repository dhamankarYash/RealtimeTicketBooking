import { prisma } from "../config/prisma";
import redisClient from "../config/redis"; // 🛠️ Import Redis!

export const createBooking = async (
  eventId: string,
  seatNumber: number
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
  
  // NX: Only set if it does NOT exist. EX: Expire in 300 seconds (5 mins).
  const acquiredLock = await redisClient.set(lockKey, "locked", {
    NX: true,
    EX: 300 
  });

  // If acquiredLock is null, someone else already clicked book!
  if (!acquiredLock) {
    throw new Error("Seat already reserved");
  }

  try {
    // 3️⃣ Try Database Booking (Only happens if we got the lock!)
    const userId = "ab43f432-12c7-4a46-8343-ccab091bdc7e"; // temp user
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); 

    return await prisma.booking.create({
      data: {
        eventId,
        seatNumber,
        userId,
        expireAt: expiryTime
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