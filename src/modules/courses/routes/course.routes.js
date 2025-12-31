import { Router } from "express";
import * as courseController from "../controllers/course.controller.js";
import * as lessonController from "../controllers/lesson.controller.js";
import { upload } from "../../../common/middleware/upload.js";

const router = Router();

// Courses
router.post("/courses", courseController.createCourse);
router.get("/courses", courseController.getAllCourses);
router.get("/courses/:courseId", courseController.getCourseById);
router.put("/courses/:courseId", courseController.updateCourse);
router.delete("/courses/:courseId", courseController.deleteCourse);
router.get("/stats/courses", courseController.getCoursesStats);
router.get("/stats/courses/:courseId", courseController.getCourseStats);

// Sections
router.post("/courses/:courseId/sections", courseController.createSection);
router.put("/sections/:sectionId", courseController.updateSection);
router.delete("/sections/:sectionId", courseController.deleteSection);
router.get("/sections/:sectionId", courseController.getSection);
router.get("/courses/:courseId/sections", courseController.getSectionsByCourse);
router.put("/courses/:courseId/sections/reorder", courseController.reorderSections);


// Lessons
router.post("/sections/:sectionId/lessons", lessonController.createLesson);
router.put("/lessons/:lessonId", lessonController.updateLesson);
router.get("/lessons/:lessonId", lessonController.getLesson);
router.delete("/lessons/:lessonId", lessonController.deleteLesson);
router.get("/lessons", lessonController.getAllLessons);
router.get("/sections/:sectionId/lessons", courseController.getLessonsBySection);
router.put("/lessons/:lessonId/video", upload.single("file"), lessonController.updateVideo);
router.put("/lessons/:lessonId/file", upload.single("file"), lessonController.updateFile);
router.put("/sections/:sectionId/lessons/reorder", lessonController.reorderLessons);


// Upload
router.post("/lessons/:lessonId/video", upload.single("file"), lessonController.uploadVideo);
router.post("/lessons/:lessonId/file", upload.single("file"), lessonController.uploadFile);
router.post("/courses/:courseId/banner", upload.single("file"), courseController.uploadBanner);
router.put("/courses/:courseId/banner", upload.single("file"), courseController.updateBanner);
router.delete("/courses/:courseId/banner", courseController.deleteBanner);


export default router;
