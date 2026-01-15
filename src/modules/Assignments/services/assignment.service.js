import * as repo from "../repositories/assignment.repoisitory.js";
import AppError from "../../../common/utils/AppError.js";
import prisma from "../../../config/prisma.js";

export const createAssignment = async (data) => {
  const { questions, questionsCount } = data;

  if (questions.length !== questionsCount)
    throw new AppError("Questions count mismatch", 400);

  return repo.createAssignment(data);
};

export const getAllAssignments = async () => {
  return repo.getAllAssignments();
};

export const getAssignmentById = async (id) => {
  const assignment = await repo.getAssignmentById(id);
  if (!assignment) throw new AppError("Assignment not found", 404);
  return assignment;
};

export const updateAssignment = async (id, data) => {
  const assignment = await repo.getAssignmentById(id);
  if (!assignment) throw new AppError("Assignment not found", 404);

  const { questions, questionsCount, ...assignmentData } = data;

  if (questions.length !== questionsCount)
    throw new AppError("Questions count mismatch", 400);

  await prisma.$transaction(async (tx) => {

    // 1️⃣ Update assignment basic data
    await tx.assignment.update({
      where: { id },
      data: assignmentData
    });

    // 2️⃣ Delete old questions
    await tx.question.deleteMany({ where: { assignmentId: id } });

    // 3️⃣ Create new questions
    for (const q of questions) {
      const question = await tx.question.create({
        data: {
          type: q.type,
          header: q.header,
          degree: q.degree,
          assignmentId: id
        }
      });

      // 4️⃣ Create options
      for (const opt of q.options) {
        await tx.option.create({
          data: {
            text: opt.text,
            isCorrect: opt.isCorrect,
            questionId: question.id
          }
        });
      }
    }
  });

  return repo.getAssignmentById(id);
};


export const deleteAssignment = async (id) => {
  await getAssignmentById(id);
  return repo.deleteAssignment(id);
};