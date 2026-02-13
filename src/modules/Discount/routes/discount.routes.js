// modules/discount/discount.routes.js
import { Router } from "express";
import * as controller from "../controllers/discount.controller.js";

const router = Router();

router.post("/", controller.createDiscount);
router.put("/:id", controller.updateDiscount);
router.delete("/:id", controller.deleteDiscount);
router.get("/", controller.getAllDiscounts);
router.get("/:id", controller.getDiscountById);

export default router;
