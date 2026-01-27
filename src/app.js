import express from 'express';

import cors from 'cors';

const app = express();

import courseModule from "./modules/courses/course.module.js";

import errorHandler from "./common/middleware/error.middleware.js"

import responseFormatter from './common/middleware/response.middleware.js'

import studentRoutes from "./modules/students/student.module.js";

import assignmentsRoutes from './modules/Assignments/assignment.module.js'

import dashboardRoutes from './modules/Dashboard/dashboard.module.js';

app.use(cors());

app.use(express.json());

app.use(responseFormatter);

// Courses module
app.use('/api', courseModule);

// Students module
app.use("/api/students", studentRoutes);

// Assinment Module
app.use("/api/assignments", assignmentsRoutes)

// Dashboard Module
app.use("/api/dashboard" , dashboardRoutes);

app.use(errorHandler);

export default app;
