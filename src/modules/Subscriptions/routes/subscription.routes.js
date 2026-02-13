import { Router } from "express";
import * as controller from "../controllers/subscription.controller.js";

const router = Router();

router.post("/", controller.createSubscription);
router.get("/", controller.getAllSubscriptions);
router.get("/:id", controller.getSubscriptionById);
router.get("/student/:studentId", controller.getStudentSubscriptions);
router.put("/:id", controller.updateSubscription);
router.delete("/:id", controller.cancelSubscription);

export default router;
