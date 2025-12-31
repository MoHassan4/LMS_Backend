import prisma from "../../../config/prisma.js";

export const updateLessonMeta = async (lessonId, meta) =>
  prisma.lesson.update({
    where: { id: lessonId },
    data: { meta },
  });

export const getLastLessonOrder = (sectionId) => {
  return prisma.lesson.findFirst({
    where: { sectionId },
    orderBy: { order: "desc" }
  });
};

  
export const createLesson = async (sectionId, data, order) =>
    prisma.lesson.create({ data: { ...data, sectionId , order } });

export const updateLessonOrder = (id, order) =>
  prisma.lesson.update({ where: { id }, data: { order } });

export const updateLesson = async (lessonId, data,order) =>
  prisma.lesson.update({ where: { id: lessonId }, data:{...data,order} });

export const getLesson = async (lessonId) =>
  prisma.lesson.findUnique({ where: { id: lessonId } });

export const deleteLesson = async (id) =>
  prisma.lesson.delete({ where: { id } });

export const reorderRemainingLessons = (sectionId) =>
  prisma.lesson.findMany({
    where: { sectionId },
    orderBy: { order: "asc" }
  });

export const getAllLessons = async () =>
  prisma.lesson.findMany({
    include: { section: true },
    orderBy: { order: "asc" },
  });
