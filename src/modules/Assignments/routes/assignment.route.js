import { Router } from "express";
import * as controller from "../controllers/assignment.controller.js";

const router = Router();

router.post("/", controller.createAssignment);
router.get("/", controller.getAllAssignments);
router.get("/:id", controller.getAssignmentById);
router.put("/:id", controller.updateAssignment);
router.delete("/:id", controller.deleteAssignment);

export default router;
