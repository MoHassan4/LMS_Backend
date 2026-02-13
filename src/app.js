import express from 'express';

import cors from 'cors';

const app = express();

import courseModule from "./modules/courses/course.module.js";

import errorHandler from "./common/middleware/error.middleware.js"

import responseFormatter from './common/middleware/response.middleware.js'

import studentRoutes from "./modules/students/student.module.js";

import assignmentsRoutes from './modules/Assignments/assignment.module.js';

import dashboardRoutes from './modules/Dashboard/dashboard.module.js';

import subscriptionRoutes from './modules/Subscriptions/subscription.module.js'

import discountRoutes from './modules/Discount/discount.module.js'

import couponRoutes from './modules/Coupon/coupon.module.js'

app.use(cors());

app.use(express.json());

app.use(responseFormatter);

// Courses module
app.use('/api', courseModule);

// Students module
app.use("/api/students", studentRoutes);

// Assinment Module
app.use("/api/assignments", assignmentsRoutes);

// Dashboard Module
app.use("/api/dashboard" , dashboardRoutes);

// Subscription Module
app.use("/api/subscriptions" , subscriptionRoutes);

// Discount Module
app.use("/api/discounts" , discountRoutes);

// Coupoun Module
app.use("/api/coupons" , couponRoutes);


app.use(errorHandler);

export default app;
