import express from 'express';

import cors from 'cors';

const app = express();

import courseModule from "./modules/courses/course.module.js";

import errorHandler from "./common/middleware/error.middleware.js"

import responseFormatter from './common/middleware/response.middleware.js'

app.use(cors());

app.use(express.json());

app.use(responseFormatter);

// Courses module
app.use('/api', courseModule);

app.use(errorHandler);

export default app;