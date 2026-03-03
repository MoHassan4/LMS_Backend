import * as repo from "../repositories/subscription.repoistory.js";
import prisma from "../../../config/prisma.js";
import { applyDiscount } from "../../Discount/services/discount.service.js";
import { applyCoupon } from "../../Coupon/services/coupon.service.js";
import AppError from "../../../common/utils/AppError.js";

export const createSubscription = async ({
  studentId,
  courseId,
  paymentMethod,
  couponCode,
  endsAt,
  status
}) => {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ validate course
    const course = await tx.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new AppError("Course not found", 404);

    // 2️⃣ prevent duplicate ACTIVE subscription
    const existing = await tx.subscription.findFirst({
      where: {
        studentId,
        courseId,
        status: "ACTIVE",
      },
    });

    if (existing) {
      throw new AppError("Student already subscribed to this course", 400);
    }

    const priceBeforeDiscount = course.price;

    // 3️⃣ apply automatic discount
    const discountResult = (await applyDiscount(
      {
        courseId,
        price: priceBeforeDiscount,
      },
      tx,
    )) || { amount: 0, discountId: null };

    const discountAmount = discountResult.amount || 0;
    const discountId = discountResult.discountId || null;

    let priceAfterDiscount = priceBeforeDiscount - discountAmount;

    // 4️⃣ apply coupon (optional)
    let couponAmount = 0;
    let couponId = null;

    if (couponCode) {
      const couponResult = (await applyCoupon(
        {
          code: couponCode,
          studentId,
          price: priceAfterDiscount,
        },
        tx,
      )) || { amount: 0, couponId: null };

      couponAmount = couponResult.amount || 0;
      couponId = couponResult.couponId || null;
    }

    // 5️⃣ final price protection
    let finalPrice = priceAfterDiscount - couponAmount;

    finalPrice = Math.max(finalPrice, 0);

    // 6️⃣ create subscription
    const subscription = await tx.subscription.create({
      data: {
        studentId,
        courseId,
        paymentMethod,
        priceBeforeDiscount,
        discountAmount: discountAmount + couponAmount,
        finalPrice,
        endsAt,
        status
      },
    });

    // 7️⃣ register coupon usage
    if (couponId) {
      await tx.couponUsage.create({
        data: {
          couponId,
          studentId,
          subscriptionId: subscription.id,
        },
      });

      await tx.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    // 8️⃣ register discount usage
    if (discountId) {
      await tx.discount.update({
        where: { id: discountId },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    return subscription;
  });
};

export const getAllSubscriptions = () => repo.findAll();

export const getSubscriptionById = (id) => repo.findById(id);

export const getStudentSubscriptions = (studentId) =>
  repo.findByStudentId(studentId);

export const updateSubscription = async (
  id,
  { paymentMethod, couponCode, status ,endsAt },
) => {
  return prisma.$transaction(async (tx) => {

    const subscription = await tx.subscription.findUnique({
      where: { id },
      include: { couponUsage: true },
    });

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    // =========================
    // 1️⃣ Validate Status
    // =========================
    let updatedStatus = subscription.status;

    if (status) {
      if (!["ACTIVE", "CANCELED", "EXPIRED"].includes(status)) {
        throw new AppError("Invalid status value", 400);
      }

      updatedStatus = status;
    }

    // =========================
    // 2️⃣ Get Course Price
    // =========================
    const course = await tx.course.findUnique({
      where: { id: subscription.courseId },
    });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const priceBeforeDiscount = course.price;

    // =========================
    // 3️⃣ Remove Old Coupon (if exists)
    // =========================
    if (subscription.couponUsage) {
      await tx.couponUsage.delete({
        where: { subscriptionId: subscription.id },
      });

      await tx.coupon.update({
        where: { id: subscription.couponUsage.couponId },
        data: {
          usedCount: { decrement: 1 },
        },
      });
    }

    // =========================
    // 4️⃣ Apply Discount
    // =========================
    const discountAmount = await applyDiscount(
      {
        courseId: subscription.courseId,
        price: priceBeforeDiscount,
      },
      tx
    );

    let priceAfterDiscount = priceBeforeDiscount - discountAmount;

    // =========================
    // 5️⃣ Apply Coupon (optional)
    // =========================
    let couponDiscount = 0;

    if (couponCode && updatedStatus === "ACTIVE") {
      couponDiscount = await applyCoupon(
        {
          code: couponCode,
          studentId: subscription.studentId,
          subscriptionId: subscription.id,
          price: priceAfterDiscount,
        },
        tx
      );
    }

    let finalPrice = priceAfterDiscount - couponDiscount;
    finalPrice = Math.max(finalPrice, 0);

    // =========================
    // 6️⃣ Update Subscription
    // =========================
    return tx.subscription.update({
      where: { id },
      data: {
        paymentMethod: paymentMethod ?? subscription.paymentMethod,
        status: updatedStatus,
        endsAt: updatedStatus === "CANCELED" ? new Date() : subscription.endsAt,
      },
    });
  });
};

export const cancelSubscription = (id) => repo.updateStatus(id, "CANCELED");

