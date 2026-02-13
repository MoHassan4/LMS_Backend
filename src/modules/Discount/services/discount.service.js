import * as repo from "../repositories/discount.repository.js";
import AppError from "../../../common/utils/AppError.js";
import prisma from "../../../config/prisma.js";

export const applyDiscount = async ({ courseId, price }) => {
  const discount = await prisma.discount.findFirst({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
      OR: [
        { appliesTo: "ALL" },
        {
          appliesTo: "COURSES",
          courseIds: { has: courseId },
        },
      ],
    },
  });

  if (!discount) return 0;

  if (discount.maxStudents && discount.usedCount >= discount.maxStudents)
    return 0;

  let discountAmount = 0;

  if (discount.type === "PERCENTAGE") {
    discountAmount = (price * discount.value) / 100;
  } else {
    discountAmount = discount.value;
  }

  await prisma.discount.update({
    where: { id: discount.id },
    data: { usedCount: { increment: 1 } },
  });

  return discountAmount;
};
export const createDiscount = async (data) => {
  if (data.appliesTo === "COURSES" && !data.courseIds?.length) {
    throw new AppError("courseIds required", 400);
  }
  return repo.create(data);
};
export const updateDiscount = async (id, data) => repo.update(id, data);
export const deleteDiscount = async (id) => repo.remove(id);
export const getAllDiscounts = () => repo.findAll();
export const getDiscountById = (id) => repo.findById(id);
