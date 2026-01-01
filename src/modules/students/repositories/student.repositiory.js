import prisma from "../../../config/prisma.js";

export const createStudent = (data) =>
  prisma.student.create({ data });

export const getAllStudents = () =>
  prisma.student.findMany({
    include: { courses: { include: { course: true } } }
  });

export const getStudentById = (id) =>
  prisma.student.findUnique({
    where: { id },
    include: { courses: { include: { course: true } } }
  });

export const updateStudent = async (studentId, data) => {
  const { courses, ...studentData } = data;

  const student = await prisma.student.update({
    where: { id: studentId },
    data: studentData
  });

  if (courses) {
    await prisma.studentCourse.deleteMany({
      where: { studentId }
    });

    await prisma.studentCourse.createMany({
      data: courses.map(courseId => ({
        studentId,
        courseId
      }))
    });
  }

  return student;
};


export const deleteStudent = (id) =>
  prisma.student.delete({ where: { id } });

export const getStudents = ({ skip, take, search, status }) => {
  return prisma.student.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: 'insensitive' } },
                { courses: { some: { course: { title: { contains: search, mode: 'insensitive' } } } } },
                { phone: { contains: search } }
              ]
            }
          : {},
        status ? { status } : {}
      ]
    },
    include: { courses: { include: { course: true } } },
    skip,
    take,
    orderBy: { createdAt: "desc" }
  });
};

export const countStudents = ({ search, status }) => {
  return prisma.student.count({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: 'insensitive' } },
                { courses: { some: { course: { title: { contains: search, mode: 'insensitive' } } } } },
                { phone: { contains: search } }
              ]
            }
          : {},
        status ? { status } : {}
      ]
    }
  });
};
