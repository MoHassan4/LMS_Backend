import prisma from "../../../config/prisma.js";

export const createAssignment = async (data) => {
  const { questions, ...assignmentData } = data;

  return prisma.assignment.create({
    data: {
      ...assignmentData,
      questions: {
        create: questions.map(q => ({
          type: q.type,
          header: q.header,
          degree: q.degree,
          options: {
            create: q.options
          }
        }))
      }
    },
    include: {
      questions: { include: { options: true } }
    }
  });
};

export const getAllAssignments = () =>
  prisma.assignment.findMany({
    include: { questions: { include: { options: true } }, section: true }
  });

export const getAssignmentById = (id) =>
  prisma.assignment.findUnique({
    where: { id },
    include: { questions: { include: { options: true } }, section: true }
  });

export const deleteQuestionsByAssignment = (assignmentId) =>
  prisma.question.deleteMany({ where: { assignmentId } });

export const updateAssignmentBase = (id, data) =>
  prisma.assignment.update({ where: { id }, data });


export const deleteAssignment = (id) =>
  prisma.assignment.delete({ where: { id } });

