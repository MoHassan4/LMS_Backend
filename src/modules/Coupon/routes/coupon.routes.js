import { Router } from "express";
import * as controller from "../controllers/coupon.controller.js";

const router = Router();

router.post("/", controller.createCoupon);
router.put("/:id", controller.updateCoupon);
router.delete("/:id", controller.deleteCoupon);
router.get("/", controller.getAllCoupons);
router.get("/:id", controller.getCouponById);

export default router;
