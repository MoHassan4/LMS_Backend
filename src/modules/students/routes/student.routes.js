import express from "express";
import * as controller from "../controllers/student.controller.js";

const router = express.Router();

router.post("/", controller.createStudent);
router.get("/", controller.getAllStudents);
router.get("/:id", controller.getStudent);
router.put("/:id", controller.updateStudent);
router.delete("/:id", controller.deleteStudent);

export default router;
