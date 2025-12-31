import * as repo from "../repositories/lesson.repository.js";
import prisma from "../../../config/prisma.js";

export const createLesson = async (sectionId, data) => {
  const last = await repo.getLastLessonOrder(sectionId);
  const order = last ? last.order + 1 : 1;

  return repo.createLesson(sectionId, data, order);
};

export const updateLesson = async (lessonId, data) => repo.updateLesson(lessonId, data);
export const deleteLesson = async (id, sectionId) => {
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) throw new AppError("Lesson not found", 404);

  await repo.deleteLesson(id);

  // إعادة ترتيب Lessons الباقية
  const lessons = await repo.reorderRemainingLessons(sectionId);

  await Promise.all(
    lessons.map((l, idx) =>
      repo.updateLessonOrder(l.id, idx + 1)
    )
  );

  return { message: "Lesson deleted and reordered successfully" };
};
export const getLesson = async (lessonId) => repo.getLesson(lessonId);

export const getAllLessons = async () => repo.getAllLessons();

export const addMetaToLesson = async (lessonId, file, type) => {
  const meta = {
    name: file.filename,
    size: file.size,
    path: `/uploads/${file.filename}`,
    type,
  };
  return repo.updateLessonMeta(lessonId, meta);
};

export const updateLessonFile = async (lessonId, file, type) => {
  const meta = {
    name: file.filename,
    size: file.size,
    path: `/uploads/${file.filename}`,
    type,
  };
  return prisma.lesson.update({
    where: { id: lessonId },
    data: { meta },
  });
};

export const reorderLessons = async (lessons) => {
  const orders = lessons.map((l) => l.order);
  if (new Set(orders).size !== orders.length)
    throw new AppError("Duplicate order values", 400);

  await Promise.all(
    lessons.map((l) => repo.updateLessonOrder(l.id, l.order))
  );
};

