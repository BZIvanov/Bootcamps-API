import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { parseQuery } from '@/utils/parseQuery.util.js';
import {
  createCourseService,
  getCourseByIdService,
  getCoursesService,
  updateCourseService,
  deleteCourseByIdService,
} from '@/services/courses.service.js';
import type {
  CourseIdParams,
  CreateCourseBody,
  CreateCourseParams,
  UpdateCourseBody,
  UpdateCourseParams,
} from '@/validation/courses.validation.js';

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of courses
 *
 * /bootcamps/{bootcampId}/courses:
 *   get:
 *     summary: Get all courses for a bootcamp
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: List of courses for a specific bootcamp
 */
export const getCourses = async (req: Request, res: Response) => {
  const query = parseQuery(req.query);

  const { courses, meta } = await getCoursesService(
    query,
    req.params.bootcampId
  );

  res.status(httpStatus.OK).json({
    success: true,
    ...meta,
    data: courses,
  });
};

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Course not found
 */
export const getCourse = async (
  req: Request<CourseIdParams>,
  res: Response
) => {
  const course = await getCourseByIdService(req.params.courseId);

  res.status(httpStatus.OK).json({ success: true, data: course });
};

/**
 * @swagger
 * /bootcamps/{bootcampId}/courses:
 *   post:
 *     summary: Create a new course for a bootcamp
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - weeks
 *               - tuition
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               weeks:
 *                 type: number
 *               tuition:
 *                 type: number
 *               minimumSkill:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bootcamp not found
 */
export const createCourse = async (
  req: Request<CreateCourseParams, unknown, CreateCourseBody>,
  res: Response
) => {
  const course = await createCourseService(
    req.params.bootcampId,
    req.body,
    req.user
  );

  res.status(httpStatus.CREATED).json({ success: true, data: course });
};

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               weeks:
 *                 type: number
 *               tuition:
 *                 type: number
 *               minimumSkill:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
export const updateCourse = async (
  req: Request<UpdateCourseParams, unknown, UpdateCourseBody>,
  res: Response
) => {
  const course = await updateCourseService(
    req.params.courseId,
    req.body,
    req.user
  );

  res.status(httpStatus.OK).json({ success: true, data: course });
};

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
export const deleteCourse = async (
  req: Request<CourseIdParams>,
  res: Response
) => {
  await deleteCourseByIdService(req.params.courseId, req.user);

  res.status(httpStatus.OK).json({ success: true });
};
