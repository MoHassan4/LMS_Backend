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

    // 3️⃣ apply discount
    const discountAmount = await applyDiscount(
      {
        courseId,
        price: priceBeforeDiscount,
      },
      tx // مهم
    );

    let priceAfterDiscount = priceBeforeDiscount - discountAmount;

    // 4️⃣ apply coupon (optional)
    let couponDiscount = 0;
    if (couponCode) {
      couponDiscount = await applyCoupon(
        {
          code: couponCode,
          studentId,
          price: priceAfterDiscount,
        },
        tx // مهم
      );
    }

    // 5️⃣ final price protection
    let finalPrice = priceAfterDiscount - couponDiscount;
    finalPrice = Math.max(finalPrice, 0);

    // 6️⃣ create subscription (مرة واحدة)
    const subscription = await tx.subscription.create({
      data: {
        studentId,
        courseId,
        paymentMethod,
        priceBeforeDiscount,
        discountAmount: discountAmount + couponDiscount,
        finalPrice,
      },
    });

    // 7️⃣ register coupon usage
    if (couponCode) {
      await tx.couponUsage.create({
        data: {
          coupon: { connect: { code: couponCode } },
          student: { connect: { id: studentId } },
          subscription: { connect: { id: subscription.id } },
        },
      });

      await tx.coupon.update({
        where: { code: couponCode },
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
  { paymentMethod, couponCode, status }
) => {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { id },
      include: { couponUsage: true },
    });

    if (!subscription)
      throw new AppError("Subscription not found", 404);

    let updatedStatus = subscription.status;

    // -------------------------
    // 1️⃣ Handle Status Change
    // -------------------------
    if (status && status !== subscription.status) {
      if (!["ACTIVE", "CANCELED","EXPIRED"].includes(status)) {
        throw new AppError("Invalid status value", 400);
      }

      updatedStatus = status;

      // لو Cancel
      if (status === "CANCELED") {
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
      }
    }

    // -------------------------
    // 2️⃣ Recalculate Pricing
    // -------------------------
    const course = await tx.course.findUnique({
      where: { id: subscription.courseId },
    });

    const priceBeforeDiscount = course.price;

    const discountAmount = await applyDiscount(
      {
        courseId: subscription.courseId,
        price: priceBeforeDiscount,
      },
      tx
    );

    let priceAfterDiscount = priceBeforeDiscount - discountAmount;
    let couponDiscount = 0;
    let newCoupon = null;

    if (couponCode && updatedStatus === "ACTIVE") {
      couponDiscount = await applyCoupon(
        {
          code: couponCode,
          studentId: subscription.studentId,
          price: priceAfterDiscount,
        },
        tx
      );

      newCoupon = await tx.coupon.findUnique({
        where: { code: couponCode },
      });
    }

    let finalPrice = priceAfterDiscount - couponDiscount;
    finalPrice = Math.max(finalPrice, 0);

    // -------------------------
    // 3️⃣ Remove Old Coupon
    // -------------------------
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

    // -------------------------
    // 4️⃣ Create New Coupon Usage
    // -------------------------
    if (newCoupon) {
      await tx.couponUsage.create({
        data: {
          couponId: newCoupon.id,
          studentId: subscription.studentId,
          subscriptionId: subscription.id,
        },
      });

      await tx.coupon.update({
        where: { id: newCoupon.id },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    // -------------------------
    // 5️⃣ Update Subscription
    // -------------------------
    return tx.subscription.update({
      where: { id },
      data: {
        paymentMethod: paymentMethod || subscription.paymentMethod,
        status: updatedStatus,
        endsAt: updatedStatus === "CANCELED" ? new Date() : null,
        priceBeforeDiscount,
        discountAmount: discountAmount + couponDiscount,
        finalPrice,
      },
    });
  });
};



export const cancelSubscription = (id) => repo.updateStatus(id, "CANCELED");

