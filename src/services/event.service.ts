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