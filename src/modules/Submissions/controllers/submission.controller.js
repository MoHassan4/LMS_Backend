import * as service from "../services/submission.service.js";

export const submitAssignment = async (req, res) => {
  const result = await service.submitAssignment(req.body);
  res.json({ message: "Submitted successfully", result });
};
