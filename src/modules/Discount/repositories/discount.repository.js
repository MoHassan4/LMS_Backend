import prisma from "../../../config/prisma.js";

export const create = (data) =>
  prisma.discount.create({ data });

export const findById = (id) =>
  prisma.discount.findUnique({ where: { id } });

export const findActiveForCourse = (courseId, now = new Date()) =>
  prisma.discount.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [
        { appliesTo: "ALL" },
        { appliesTo: "COURSES", courseIds: { has: courseId } }
      ]
    }
  });

export const update = (id, data) =>
  prisma.discount.update({
    where: { id },
    data
  });

export const remove = (id) =>
  prisma.discount.update({
    where: { id },
    data: { isActive: false }
  });

export const findAll = () => prisma.discount.findMany();


