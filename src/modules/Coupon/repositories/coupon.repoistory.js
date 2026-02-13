import prisma from "../../../config/prisma.js";

export const findByCode = (code) =>
  prisma.coupon.findUnique({
    where: { code },
    include: { usages: true },
  });

export const createCoupon = (data) =>
  prisma.coupon.create({ data });

export const updateCoupon = (id, data) =>
  prisma.coupon.update({
    where: { id },
    data,
  });

export const deleteCoupon = (id) =>
  prisma.coupon.delete({
    where: { id },
  });

export const createUsage = (data) =>
  prisma.couponUsage.create({ data });

export const countStudentUsage = (couponId, studentId) =>
  prisma.couponUsage.count({
    where: { couponId, studentId },
  });

  export const findAll = () =>
  prisma.coupon.findMany({
    include: { usages: true },
  });

export const findById = (id) =>
  prisma.coupon.findUnique({
    where: { id },
    include: { usages: true },
  });
