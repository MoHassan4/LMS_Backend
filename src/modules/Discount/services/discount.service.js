import * as repo from "../repositories/discount.repository.js";
import AppError from "../../../common/utils/AppError.js";
import prisma from "../../../config/prisma.js";

export const applyDiscount = async ({ courseId, price }, tx) => {
  const now = new Date();

  const discounts = await tx.discount.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [
        { appliesTo: "ALL" },
        {
          appliesTo: "COURSES",
          courseIds: { has: courseId },
        },
      ],
    },
  });

  if (!discounts.length) return 0;

  let maxDiscount = 0;
  let selectedDiscount = null;

  for (const discount of discounts) {
    if (
      discount.maxStudents &&
      discount.usedCount >= discount.maxStudents
    )
      continue;

    let amount =
      discount.type === "PERCENTAGE"
        ? (price * discount.value) / 100
        : discount.value;

    if (amount > maxDiscount) {
      maxDiscount = amount;
      selectedDiscount = discount;
    }
  }

  return {
    amount: maxDiscount,
    discountId: selectedDiscount?.id || null,
  };
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
