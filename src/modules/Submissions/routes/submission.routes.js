import express from "express";
import * as controller from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/", controller.submitAssignment);

export default router;