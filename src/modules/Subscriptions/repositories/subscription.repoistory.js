import  prisma from "../../../config/prisma.js";

export const create = (data) =>
  prisma.subscription.create({
    data,
    include: {
      student: true,
      course: true,
    },
  });

export const findAll = () =>
  prisma.subscription.findMany({
    include: {
      student: true,
      course: true,
    },
  });

export const findById = (id) =>
  prisma.subscription.findUnique({
    where: { id },
    include: {
      student: true,
      course: true,
    },
  });

export const findByStudentId = (studentId) =>
  prisma.subscription.findMany({
    where: { studentId },
    include: {
      course: true,
    },
  });

export const updateStatus = (id, status) =>
  prisma.subscription.update({
    where: { id },
    data: { status },
  });
