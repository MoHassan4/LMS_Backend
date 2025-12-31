import * as repo from "../repositories/course.repository.js";
import prisma from "../../../config/prisma.js";


export const createCourseWithSections = async (data) => {
  return repo.createCourseWithSections(data);
};

export const getAllCourses = async () => repo.getAllCourses();
export const getCourseById = async (id) => repo.getCourseById(id);
export const updateCourse = async (id, data) => repo.updateCourse(id, data);

export const createSection = async (courseId, data) => {
  // إيجاد آخر order
  const last = await repo.getLastSectionOrder(courseId);
  const order = last ? last.order + 1 : 1;

  return repo.createSection(courseId, data, order);
};

export const updateSection = async (sectionId, data) => repo.updateSection(sectionId, data);


export const deleteCourse = async (id) => repo.deleteCourse(id);

export const deleteSection = async (id, courseId) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw new AppError("Section not found", 404);

  // حذف Section
  await repo.deleteSection(id);

  // إعادة ترتيب Sections الباقية
  const sections = await repo.reorderRemainingSections(courseId);

  // إعادة تعيين order تلقائي
  await Promise.all(
    sections.map((s, idx) =>
      repo.updateSectionOrder(s.id, idx + 1) // order يبدأ من 1
    )
  );

  return { message: "Section deleted and reordered successfully" };
};


export const getSection = async (id) => repo.getSection(id);
export const getLessonsBySection = async (sectionId) => repo.getLessonsBySection(sectionId);

export const getCoursesStats = async () => {
  return repo.getCoursesStats();
};

export const getCourseStats = async (courseId) => {
  return repo.getCourseStats(courseId);
};

export const uploadBanner = async (courseId, file) => {
  const bannerPath = `/uploads/${file.filename}`;
  return prisma.course.update({
    where: { id: courseId },
    data: { banner: bannerPath },
  });
};

export const updateBanner = async (courseId, file) => {
  const bannerPath = `/uploads/${file.filename}`;
  return prisma.course.update({
    where: { id: courseId },
    data: { banner: bannerPath },
  });
};

export const deleteBanner = async (courseId) => {
  return prisma.course.update({
    where: { id: courseId },
    data: { banner: null },
  });
};

export const getSectionsByCourse = (courseId) => {
  return repo.getSectionsByCourse(courseId);
};

export const reorderSections = async (sections) => {
  const orders = sections.map((s) => s.order);
  if (new Set(orders).size !== orders.length)
    throw new AppError("Duplicate order values", 400);

  await Promise.all(
    sections.map((s) => repo.updateSectionOrder(s.id, s.order))
  );
};