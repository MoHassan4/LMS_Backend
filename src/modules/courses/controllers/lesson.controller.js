import * as lessonService from "../services/lesson.service.js";
import AppError from "../../../common/utils/AppError.js"

export const createLesson = async (req, res,next) => {
  try {
    const lesson = await lessonService.createLesson(
      req.params.sectionId,
      req.body
    );
    res.status(201).json(lesson);
  } catch (err) {
    next(err)
  }
};

export const updateLesson = async (req, res,next) => {
  try {
    const lesson = await lessonService.updateLesson(
      req.params.lessonId,
      req.body
    );
    if (!lesson) throw new AppError("Lesson not found", 404);
    res.json(lesson);
  } catch (err) {
    next(err)
  }
};

export const deleteLesson = async (req, res,next) => {
  try {
    const { lessonId, sectionId } = req.params;
    const lesson = await lessonService.deleteLesson(lessonId, sectionId);
    if (!lesson) throw new AppError("Lesson not found", 404);
    res.json({ message: "Lesson deleted", lesson });
  } catch (err) {
    next(err)
  }
};

export const getLesson = async (req, res,next) => {
  try {
    const lesson = await lessonService.getLesson(req.params.lessonId);
    if (!lesson) throw new AppError("Lesson not found", 404);
    res.json(lesson);
  } catch (err) {
    next(err)
  }
};

export const getAllLessons = async (req, res,next) => {
  try {
    const lessons = await lessonService.getAllLessons();
    if (!lessons) throw new AppError("Not Lessons found", 404);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

export const uploadVideo = async (req, res,next) => {
  try {
    const lesson = await lessonService.addMetaToLesson(
      req.params.lessonId,
      req.file,
      "VIDEO"
    );
    res.json(lesson);
  } catch (err) {
   next(err)
  }
};

export const uploadFile = async (req, res,next) => {
  try {
    const lesson = await lessonService.addMetaToLesson(
      req.params.lessonId,
      req.file,
      "FILE"
    );
    res.json(lesson);
  } catch (err) {
    next(err)
  }
};

export const updateVideo = async (req, res,next) => {
  try {
    const lesson = await lessonService.updateLessonFile(
      req.params.lessonId,
      req.file,
      "VIDEO"
    );
    res.json(lesson);
  } catch (err) {
    next(err)
  }
};

export const updateFile = async (req, res,next) => {
  try {
    const lesson = await lessonService.updateLessonFile(
      req.params.lessonId,
      req.file,
      "FILE"
    );
    res.json(lesson);
  } catch (err) {
    next(err)
  }
};

export const reorderLessons = async (req, res,next) => {
  await lessonService.reorderLessons(req.body.lessons);
  res.json({ message: "Lessons reordered successfully" });
};
