import cron from "node-cron";
import { prisma } from "../config/prisma";

export const startBookingExpiryJob = () => {

  cron.schedule("* * * * *", async () => {

    console.log("Checking expired bookings...");

    const expiredBookings = await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date()
        }
      },
      data: {
        status: "EXPIRED"
      }
    });

    if (expiredBookings.count > 0) {
      console.log(`Expired bookings updated: ${expiredBookings.count}`);
    }

  });

};