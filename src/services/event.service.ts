import { prisma } from "../config/prisma";
import redisClient from "../config/redis"; // 🛠️ Import Redis!

export const createEvent = async (data: any) => {
  return prisma.event.create({
    data,
  });
};

export const getEvents = async (page: number, limit: number) => {
  // 1️⃣ Check Redis Cache first
  const cacheKey = `events:page:${page}:limit:${limit}`;
  const cachedEvents = await redisClient.get(cacheKey);

  if (cachedEvents) {
    console.log("🚀 Cache HIT: Returning events from Redis");
    return JSON.parse(cachedEvents);
  }

  console.log("🐌 Cache MISS: Fetching events from PostgreSQL");
  
  // 2️⃣ If not in cache, fetch from Database
  const skip = (page - 1) * limit;
  const events = await prisma.event.findMany({
    skip,
    take: limit,
    orderBy: {
      eventDate: "asc",
    },
  });

  // 3️⃣ Store the result in Redis for future requests (Expire after 1 hour / 3600 seconds)
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(events));

  return events;
};

export const searchEvents = async (filters: any) => {
  const where: any = {};

  if (filters.location) {
    where.location = {
      contains: filters.location,
      mode: "insensitive"
    };
  }

  if (filters.price) {
    where.price = Number(filters.price);
  }

  if (filters.date) {
    where.eventDate = new Date(filters.date);
  }

  return prisma.event.findMany({
    where,
    orderBy: {
      eventDate: "asc"
    }
  });
};

export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error("Event not found");
  return event;
};

export const updateEvent = async (id: string, data: any) => {
  return prisma.event.update({
    where: { id },
    data,
  });
};

export const deleteEvent = async (id: string) => {
  // 1️⃣ First, delete all bookings associated with this event
  await prisma.booking.deleteMany({
    where: { eventId: id }
  });

  // 2️⃣ Now that the event is "empty", it is safe to delete it!
  return prisma.event.delete({ 
    where: { id } 
  });
};