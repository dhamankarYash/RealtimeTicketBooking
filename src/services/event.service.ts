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

// 🛠️ UPGRADED: Now handles Price Ranges (min/max) and partial location matching
export const searchEvents = async (filters: any) => {
  const where: any = {};

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }

  // 📈 Advanced Filtering: Greater than / Less than
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = Number(filters.minPrice);
    if (filters.maxPrice) where.price.lte = Number(filters.maxPrice);
  }

  if (filters.date) {
    where.eventDate = new Date(filters.date);
  }

  return prisma.event.findMany({
    where,
    orderBy: { eventDate: "asc" }
  });
};

// 🌟 NEW: Analytics & Query Optimization + Redis Cache
export const getPopularEvents = async () => {
  const cacheKey = "events:popular";
  
  // 1. Check Cache First (Analytics are heavy, cache them!)
  const cachedPopular = await redisClient.get(cacheKey);
  if (cachedPopular) {
    console.log("🚀 Cache HIT: Returning popular events");
    return JSON.parse(cachedPopular);
  }

  console.log("🐌 Cache MISS: Calculating popular events in DB");
  
  // 2. Query Optimization: Let Postgres count the relations instead of Node.js
  const popularEvents = await prisma.event.findMany({
    take: 5, // Top 5
    orderBy: {
      bookings: {
        _count: "desc" // Sort by most bookings
      }
    },
    include: {
      _count: {
        select: { bookings: true } // Return the exact count in the response
      }
    }
  });

  // 3. Cache the result for 5 minutes
  await redisClient.setEx(cacheKey, 300, JSON.stringify(popularEvents));

  return popularEvents;
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