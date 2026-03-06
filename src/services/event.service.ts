import { prisma } from "../config/prisma";

export const createEvent = async (data: any) => {
  return prisma.event.create({
    data,
  });
};

export const getEvents = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  return prisma.event.findMany({
    skip,
    take: limit,
    orderBy: {
      eventDate: "asc",
    },
  });
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