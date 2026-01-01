import * as service from "../services/student.service.js";

export const createStudent = async (req, res, next) => {
  try {
    const student = await service.createStudent(req.body);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// export const getAllStudents = async (req, res, next) => {
//   try {
//     const students = await service.getAllStudents();
//     res.json(students);
//   } catch (error) {
//     next(error);
//   }
// };

export const getStudent = async (req, res, next) => {
  try {
    const student = await service.getStudent(req.params.id);
    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await service.updateStudent(req.params.id, req.body);
    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    await service.deleteStudent(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (error) {
    next(error);
  }
};

export const getAllStudents = async (req, res, next) => {
  try {
    const students = await service.getAllStudents(req.query);
    res.json(students);
  } catch (error) {
    next(error)
  }
};
