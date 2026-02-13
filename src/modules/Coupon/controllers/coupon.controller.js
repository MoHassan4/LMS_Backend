import * as couponService from "../services/coupon.service.js";

export const createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    res.json(coupon);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await couponService.deleteCoupon(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.json(coupons);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

