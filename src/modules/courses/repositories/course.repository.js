import prisma from "../../../config/prisma.js";

// Create Course with nested Sections & Lessons
export const createCourseWithSections = async (data) => {
  const { title, description, banner, price, grade, subject, sections } = data;

  return prisma.course.create({
    data: {
      title,
      description,
      banner,
      price,
      grade,
      subject,
      sections: {
        create: sections?.map((section, sIndex) => ({
          title: section.title,
          description: section.description,
          order: sIndex + 1,
          lessons: {
            create: section.lessons?.map((lesson, lIndex) => ({
              title: lesson.title,
              type: lesson.type,
              meta: lesson.meta || null,
              order: lIndex + 1,
            })),
          },
        })),
      },
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });
};

// Get all Courses with number of videos
export const getAllCourses = async () =>
  prisma.course.findMany({
    include: {
      sections: { include: { lessons: true } },
    },
  });

export const getCourseById = async (id) =>
  prisma.course.findUnique({
    where: { id },
    include: {
      sections: { include: { lessons: true } },
    },
  });


export const updateSection = async (sectionId, data) =>
    prisma.section.update({ where: { id: sectionId }, data });

export const updateCourse = async (id, data) => {

  return prisma.course.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      banner: data.banner,
      price: data.price,
      grade: data.grade,
      subject: data.subject,
      
      sections: {
        upsert: await Promise.all(data.sections?.map(async (section) => {
          let sectionOrder = section.order;

          // لو مفيش order محدد، نجيب آخر order موجود في الدورة
          if (!sectionOrder) {
            const lastSection = await prisma.section.findFirst({
              where: { courseId: id },
              orderBy: { order: "desc" }
            });
            sectionOrder = lastSection ? lastSection.order + 1 : 1;
          }

          return {
            where: { id: section.id || "new-" + Math.random() },
            create: {
              title: section.title,
              description: section.description,
              order: sectionOrder,
              lessons: {
                create: await Promise.all(section.lessons?.map(async (lesson) => {
                  let lessonOrder = lesson.order;

                  if (!lessonOrder) {
                    // لو مفيش order محدد للدرس، نجيب آخر order موجود في هذا القسم
                    const lastLesson = await prisma.lesson.findFirst({
                      where: { sectionId: section.id || undefined },
                      orderBy: { order: "desc" }
                    });
                    lessonOrder = lastLesson ? lastLesson.order + 1 : 1;
                  }

                  return {
                    title: lesson.title,
                    type: lesson.type,
                    meta: lesson.meta,
                    order: lessonOrder
                  };
                })) || []
              }
            },
            update: {
              title: section.title,
              description: section.description,
              order: sectionOrder,
              lessons: {
                upsert: await Promise.all(section.lessons?.map(async (lesson) => {
                  let lessonOrder = lesson.order;

                  if (!lessonOrder) {
                    const lastLesson = await prisma.lesson.findFirst({
                      where: { sectionId: section.id },
                      orderBy: { order: "desc" }
                    });
                    lessonOrder = lastLesson ? lastLesson.order + 1 : 1;
                  }

                  return {
                    where: { id: lesson.id || "new-" + Math.random() },
                    create: {
                      title: lesson.title,
                      type: lesson.type,
                      meta: lesson.meta,
                      order: lessonOrder
                    },
                    update: {
                      title: lesson.title,
                      type: lesson.type,
                      meta: lesson.meta,
                      order: lessonOrder
                    }
                  };
                })) || []
              }
            }
          };
        })) || []
      }
    },
        include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } }
        }
      }
    }
  });
};

// Get آخر order للـ Course
export const getLastSectionOrder = (courseId) =>
  prisma.section.findFirst({
    where: { courseId },
    orderBy: { order: "desc" }
  });

export const createSection = async (courseId, data,order) =>
  prisma.section.create({ data: { ...data, courseId , order} });

// تحديث order لقسم
export const updateSectionOrder = (id, order) =>
  prisma.section.update({ where: { id }, data: { order } });

// Delete
export const deleteCourse = async (id) =>
  prisma.course.delete({ where: { id } });

export const deleteSection = async (id) =>
  prisma.section.delete({ where: { id } });

export const reorderRemainingSections = (courseId) =>
  prisma.section.findMany({
    where: { courseId },
    orderBy: { order: "asc" }
  });

export const getSection = async (id) =>
  prisma.section.findUnique({
    where: { id },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

export const getLessonsBySection = async (sectionId) =>
  prisma.lesson.findMany({
    where: { sectionId },
    orderBy: { order: "asc" },
  });

export const getCoursesStats = async () => {
  const courses = await prisma.course.findMany({
    include: { sections: { include: { lessons: true } } },
  });

  return courses.map(course => ({
    id: course.id,
    title: course.title,
    totalSections: course.sections.length,
    totalLessons: course.sections.reduce((acc, s) => acc + s.lessons.length, 0),
    totalVideos: course.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.type === "VIDEO").length, 0),
    totalFiles: course.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.type === "FILE").length, 0),
    totalQuizzes: course.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.type === "QUIZ").length, 0),
  }));
};

export const getCourseStats = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { sections: { include: { lessons: true } } },
  });

  if (!course) throw new Error("Course not found");

  return {
    id: course.id,
    title: course.title,
    totalSections: course.sections.length,
    totalLessons: course.sections.reduce((acc, s) => acc + s.lessons.length, 0),
    totalVideos: course.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.type === "VIDEO").length, 0),
    totalFiles: course.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.type === "FILE").length, 0),
    totalQuizzes: course.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.type === "QUIZ").length, 0),
  };
};

export const getSectionsByCourse = (courseId) => {
  return prisma.section.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        select: {
          id: true,
          title: true,
          type: true
        },
        orderBy: { order: "asc" }
      }
    }
  });
};
