import prisma from "../../../config/prisma.js";

export const createSubmission = (data) =>
  prisma.studentAssignment.create({ data });

export const getAssignmentWithQuestions = (id) =>
  prisma.assignment.findUnique({
    where: { id },
    include: { questions: { include: { options: true } } }
  });
