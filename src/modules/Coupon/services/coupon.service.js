import * as repo from "../repositories/coupon.repoistory.js";
import AppError from "../../../common/utils/AppError.js";

/**
 * Create a coupon
 */
export const createCoupon = async (data) => {
  // التأكد من عدم تكرار الكود
  const existing = await repo.findByCode(data.code);
  if (existing) throw new AppError("Coupon code already exists", 400);

  return repo.createCoupon(data);
};

/**
 * Update a coupon
 */
export const updateCoupon = async (id, data) => {
  const coupon = await repo.findById(id);
  if (!coupon) throw new AppError("Coupon not found", 404);

  // لو الكود اتغير، نتأكد من عدم تكراره
  if (data.code && data.code !== coupon.code) {
    const codeExists = await repo.findByCode(data.code);
    if (codeExists) throw new AppError("Coupon code already exists", 400);
  }

  return repo.updateCoupon(id, data);
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (id) => {
  const coupon = await repo.findById(id);
  if (!coupon) throw new AppError("Coupon not found", 404);

  return repo.deleteCoupon(id);
};


export const applyCoupon = async (
  { code, studentId, price },
  tx
) => {
  const coupon = await tx.coupon.findUnique({
    where: { code },
  });

  if (!coupon || !coupon.isActive)
    throw new AppError("Invalid coupon", 400);

  if (coupon.expiresAt < new Date())
    throw new AppError("Coupon expired", 400);

  if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage)
    throw new AppError("Coupon usage limit reached", 400);

  const studentUsage = await tx.couponUsage.count({
    where: {
      couponId: coupon.id,
      studentId,
    },
  });

  if (
    coupon.maxUsagePerStudent &&
    studentUsage >= coupon.maxUsagePerStudent
  )
    throw new AppError("Coupon already used", 400);

  const discountAmount =
    coupon.type === "PERCENTAGE"
      ? (price * coupon.value) / 100
      : coupon.value;

  return {
    amount: discountAmount,
    couponId: coupon.id,
  };
};

export const getAllCoupons = () => repo.findAll();

export const getCouponById = (id) => repo.findById(id);
