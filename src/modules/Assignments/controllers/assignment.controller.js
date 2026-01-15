import * as service from "../services/assignment.service.js";
import prisma from "../../../config/prisma.js";

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await service.createAssignment(req.body);
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

export const getAllAssignments = async (req, res) => {
  const data = await service.getAllAssignments();
  res.json(data);
};

export const getAssignmentById = async (req, res) => {
  const data = await service.getAssignmentById(req.params.id);
  res.json(data);
};

export const updateAssignment = async (req, res) => {
  const data = await service.updateAssignment(req.params.id, req.body);
  res.json({ message: "Assignment updated successfully", data });
};


export const deleteAssignment = async (req, res) => {
  await service.deleteAssignment(req.params.id);
  res.json({ message: "Assignment deleted" });
};