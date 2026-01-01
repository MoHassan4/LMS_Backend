import * as repo from "../repositories/student.repositiory.js";
import AppError from "../../../common/utils/AppError.js";

export const createStudent = async (data) => {
  const { courses = [], ...info } = data;

  return repo.createStudent({
    ...info,
    courses: {
      create: courses.map(courseId => ({ courseId }))
    }
  });
};

// export const getAllStudents = async () => {
//   const students = await repo.getAllStudents();

//   return students.map(s => ({
//     id: s.id,
//     name: s.name,
//     phone: s.phone,
//     courses: s.courses.map(c => c.course.title),
//     createdAt: s.createdAt,
//     status: s.status
//   }));
// };

export const getStudent = async (id) => {
  const student = await repo.getStudentById(id);
  if (!student) throw new AppError("Student not found", 404);
  return student;
};

export const updateStudent = async (id, data) =>
  repo.updateStudent(id, data);

export const deleteStudent = async (id) =>
  repo.deleteStudent(id);

export const getAllStudents = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    repo.getStudents({ skip, take: limit, search: query.search, status: query.status }),
    repo.countStudents({ search: query.search, status: query.status })
  ]);

  return {
    data: students.map(s => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      courses: s.courses.map(c => c.course.title),
      createdAt: s.createdAt,
      status: s.status
    })),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};
