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
  // نجيب آخر order للقسم في الدورة
  const lastSection = await prisma.section.findFirst({
    where: { courseId: id },
    orderBy: { order: 'desc' }
  });
  let nextSectionOrder = lastSection ? lastSection.order + 1 : 1;

  const sectionsUpsert = [];
  const sectionsCreate = [];

  for (const section of (data.sections || [])) {
    if (section.id) {
      // Section موجود → upsert
      const lessonsUpsert = [];
      const lessonsCreate = [];

      // نجيب آخر order للدرس في القسم لو هناك دروس جديدة
      const lastLessonInSection = await prisma.lesson.findFirst({
        where: { sectionId: section.id },
        orderBy: { order: 'desc' }
      });
      let nextLessonOrder = lastLessonInSection ? lastLessonInSection.order + 1 : 1;

      for (const lesson of (section.lessons || [])) {
        if (lesson.id) {
          // Lesson موجود → سيب order كما هو إذا مش موجود في JSON
          const lessonUpdate = {
            title: lesson.title,
            type: lesson.type,
            meta: lesson.meta
          };
          if (lesson.order !== undefined) lessonUpdate.order = lesson.order;

          lessonsUpsert.push({
            where: { id: lesson.id },
            update: lessonUpdate,
            create: {
              title: lesson.title,
              type: lesson.type,
              meta: lesson.meta,
              order: lesson.order || nextLessonOrder
            }
          });
        } else {
          // Lesson جديد → order = آخر درس موجود +1
          lessonsCreate.push({
            title: lesson.title,
            type: lesson.type,
            meta: lesson.meta,
            order: nextLessonOrder
          });
          nextLessonOrder++;
        }
      }

      const sectionUpdate = {
        title: section.title,
        description: section.description,
        lessons: {
          upsert: lessonsUpsert,
          create: lessonsCreate
        }
      };
      if (section.order !== undefined) sectionUpdate.order = section.order;

      sectionsUpsert.push({
        where: { id: section.id },
        update: sectionUpdate,
        create: {
          title: section.title,
          description: section.description,
          order: section.order || nextSectionOrder,
          lessons: { create: [...lessonsCreate, ...lessonsUpsert.map(l => l.create)] }
        }
      });

    } else {
      // Section جديد → create
      let nextLessonOrder = 1;
      const lessonsCreate = [];

      for (const lesson of (section.lessons || [])) {
        lessonsCreate.push({
          title: lesson.title,
          type: lesson.type,
          meta: lesson.meta,
          order: nextLessonOrder
        });
        nextLessonOrder++;
      }

      sectionsCreate.push({
        title: section.title,
        description: section.description,
        order: nextSectionOrder,
        lessons: { create: lessonsCreate }
      });
    }

    nextSectionOrder++;
  }

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
        create: sectionsCreate,
        upsert: sectionsUpsert
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
