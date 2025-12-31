import * as courseService from "../services/course.service.js";
import AppError from "../../../common/utils/AppError.js";

// Create Course with Sections and Lessons
export const createCourse = async (req, res,next) => {
  try {
    const course = await courseService.createCourseWithSections(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err)
  }
};

// Get all Courses
export const getAllCourses = async (req, res,next) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (err) {
    next(err)
  }
};

// Get single Course
export const getCourseById = async (req, res,next) => {
  try {
    const course = await courseService.getCourseById(req.params.courseId);
    if (!course) throw new AppError("Course not found", 404);
    res.json(course);
  } catch (err) {
    next(err)
  }
};

// Update Course
export const updateCourse = async (req, res,next) => {
  try {
    const course = await courseService.updateCourse(
      req.params.courseId,
      req.body
    );
    if (!course) throw new AppError("Course not found", 404);
    res.json(course);
  } catch (err) {
    next(err)
  }
};

// Sections
export const createSection = async (req, res,next) => {
  try {
    const section = await courseService.createSection(
      req.params.courseId,
      req.body
    );
    res.status(201).json(section);
  } catch (err) {
    next(err)
  }
};

export const updateSection = async (req, res,next) => {
  try {
    const section = await courseService.updateSection(
      req.params.sectionId,
      req.body
    );
    if (!section) throw new AppError("Section not found", 404);
    res.json(section);
  } catch (err) {
    next(err)
  }
};

// Delete
export const deleteCourse = async (req, res,next) => {
  try {
    const course = await courseService.deleteCourse(req.params.courseId);
    if (!course) throw new AppError("Course not found", 404);
    res.json({ message: "Course deleted", course });
  } catch (err) {
    next(err)
  }
};

export const deleteSection = async (req, res,next) => {
  try {
    const { sectionId, courseId } = req.params;
    const section = await courseService.deleteSection(sectionId, courseId);
    if (!section) throw new AppError("Section not found", 404);
    res.json({ message: "Section deleted", section });
  } catch (err) {
    next(err)
  }
};

// Get Section
export const getSection = async (req, res,next) => {
  try {
    const section = await courseService.getSection(req.params.sectionId);
    if (!section) throw new AppError("Section not found", 404);
    res.json(section);
  } catch (err) {
    next(err)
  }
};

// Get All Lessons for Specific Section
export const getLessonsBySection = async (req, res,next) => {
  try {
    const lessons = await courseService.getLessonsBySection(
      req.params.sectionId
    );
    if (!lessons) throw new AppError("Not Lessons found", 404);
    res.json(lessons);
  } catch (err) {
    next(err)
  }
};

export const getCoursesStats = async (req, res,next) => {
  try {
    const stats = await courseService.getCoursesStats();
    if (!stats) throw new AppError("Not Courses found", 404);
    res.json(stats);
  } catch (err) {
    next(err)
  }
};

export const getCourseStats = async (req, res,next) => {
  try {
    const stats = await courseService.getCourseStats(req.params.courseId);
    if (!stats) throw new AppError("Course Not found", 404);
    res.json(stats);
  } catch (err) {
    next(err)
  }
};

// Upload Banner (POST)
export const uploadBanner = async (req, res,next) => {
  try {
    const course = await courseService.uploadBanner(
      req.params.courseId,
      req.file
    );
    if (!course) throw new AppError("Course Not found", 404);
    res.json(course);
  } catch (err) {
    next(err)
  }
};

// Update Banner (PUT)
export const updateBanner = async (req, res,next) => {
  try {
    const course = await courseService.updateBanner(
      req.params.courseId,
      req.file
    );
    if (!course) throw new AppError("Course Not found", 404);
    res.json(course);
  } catch (err) {
    next(err)
  }
};

// Delete Banner (DELETE)
export const deleteBanner = async (req, res,next) => {
  try {
    const course = await courseService.deleteBanner(req.params.courseId);
    if (!course) throw new AppError("Course Not found", 404);
    res.json({ message: "Banner deleted", course });
  } catch (err) {
    next(err)
  }
};

export const getSectionsByCourse = async (req, res,next) => {
  try {
    const sections = await courseService.getSectionsByCourse(
      req.params.courseId
    );
    if (!sections) throw new AppError("Course Not found", 404);
    res.json(sections);
  } catch (err) {
    next(err)
  }
};

export const reorderSections = async (req, res,next) => {
  await courseService.reorderSections(req.body.sections);
  res.json({ message: "Sections reordered successfully" });
};
