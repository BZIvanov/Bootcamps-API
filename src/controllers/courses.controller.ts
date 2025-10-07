import type { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Course from '@/models/course.model.js';
import { HttpError } from '@/utils/httpError.util.js';
import { userTypes } from '@/constants/user.constants.js';
import { parseQuery } from '@/utils/parseQuery.util.js';
import {
  createCourseService,
  getCourseByIdService,
  getCoursesService,
} from '@/services/courses.service.js';
import type { IdParam } from '@/types/http.types.js';

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
  const { bootcampId } = req.params;

  const query = parseQuery(req.query);

  const { courses, meta } = await getCoursesService(query, bootcampId);

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
export const getCourse = async (req: Request<IdParam>, res: Response) => {
  const course = await getCourseByIdService(req.params.id);

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
export const createCourse = async (req: Request, res: Response) => {
  const course = await createCourseService(
    req.params.bootcampId!,
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Course with id: ${req.params.id} not found.`
      )
    );
  }

  if (
    course.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to update course with id ${course._id}`
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Course with id: ${req.params.id} not found.`
      )
    );
  }

  if (
    course.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to delete course with id ${course._id}`
      )
    );
  }

  // here is important to use remove method to trigger remove hook in the model
  await course.deleteOne();

  res.status(httpStatus.OK).json({ success: true });
};
