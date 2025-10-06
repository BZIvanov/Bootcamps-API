import path from 'path';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { UploadedFile } from 'express-fileupload';
import Bootcamp from '@/models/bootcamp.model.js';
import { HttpError } from '@/utils/httpError.util.js';
import { userTypes } from '@/constants/user.constants.js';
import { parseQuery } from '@/utils/parseQuery.util.js';
import {
  createBootcampService,
  getBootcampByIdService,
  getBootcampsService,
} from '@/services/bootcamps.service.js';
import { IdParam } from '@/types/http.types.js';

/**
 * @swagger
 * tags:
 *   name: Bootcamps
 *   description: Bootcamp management endpoints
 */

/**
 * @swagger
 * /bootcamps:
 *   get:
 *     summary: Get all bootcamps
 *     tags: [Bootcamps]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: List of bootcamps
 */
export const getBootcamps = async (req: Request, res: Response) => {
  const query = parseQuery(req.query);

  const result = await getBootcampsService(query);

  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
};

/**
 * @swagger
 * /bootcamps/{id}:
 *   get:
 *     summary: Get a single bootcamp by ID
 *     tags: [Bootcamps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bootcamp found
 *       404:
 *         description: Bootcamp not found
 */
export const getBootcamp = async (req: Request<IdParam>, res: Response) => {
  const bootcamp = await getBootcampByIdService(req.params.id);

  res.status(httpStatus.OK).json({ success: true, data: bootcamp });
};

/**
 * @swagger
 * /bootcamps:
 *   post:
 *     summary: Create a new bootcamp
 *     tags: [Bootcamps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Dev Bootcamp"
 *             description: "Learn full-stack web development in 12 weeks"
 *             website: "https://devbootcamp.com"
 *             phone: "(123) 456-7890"
 *             address: "123 Main St, San Francisco, CA"
 *             careers: ["Web Development", "UI/UX"]
 *             averageRating: 8.5
 *             averageCost: 12000
 *             photo: "bootcamp.jpg"
 *             user: "64f3a1b7e5a1f1b2c3d4e5f6"
 *     responses:
 *       201:
 *         description: Bootcamp created successfully
 *       400:
 *         description: User already has a published bootcamp
 *       401:
 *         description: Unauthorized
 */
export const createBootcamp = async (req: Request, res: Response) => {
  const bootcamp = await createBootcampService(req.user, req.body);

  res.status(httpStatus.CREATED).json({ success: true, data: bootcamp });
};

/**
 * @swagger
 * /bootcamps/{id}:
 *   put:
 *     summary: Update a bootcamp
 *     tags: [Bootcamps]
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
 *           example:
 *             name: "Dev Bootcamp"
 *             description: "Learn full-stack web development in 12 weeks"
 *             website: "https://devbootcamp.com"
 *             phone: "(123) 456-7890"
 *             address: "123 Main St, San Francisco, CA"
 *             careers: ["Web Development", "UI/UX"]
 *             averageRating: 8.5
 *             averageCost: 12000
 *             photo: "bootcamp.jpg"
 *             user: "64f3a1b7e5a1f1b2c3d4e5f6"
 *     responses:
 *       200:
 *         description: Bootcamp updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bootcamp not found
 */
export const updateBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Bootcamp with id: ${req.params.id} not found`
      )
    );
  }

  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to update this resource`
      )
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.OK).json({ success: true, data: bootcamp });
};

/**
 * @swagger
 * /bootcamps/{id}:
 *   delete:
 *     summary: Delete a bootcamp
 *     tags: [Bootcamps]
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
 *         description: Bootcamp deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bootcamp not found
 */
export const deleteBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // findByIdAndDelete will not trigger schema middlewares, so here later remove method is used.
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Bootcamp with id: ${req.params.id} not found`
      )
    );
  }

  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to delete this resource`
      )
    );
  }

  // deleteOne method is important to be used like this to trigger the pre method of the schema
  await bootcamp.deleteOne();

  res.status(httpStatus.OK).json({ success: true });
};

/**
 * @swagger
 * /bootcamps/{id}/photo:
 *   put:
 *     summary: Upload photo for a bootcamp
 *     tags: [Bootcamps]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imageFile
 *             properties:
 *               imageFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Invalid file or file too large
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bootcamp not found
 *       500:
 *         description: Upload failed
 */
export const bootcampPhotoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Bootcamp with id: ${req.params.id} not found`
      )
    );
  }

  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to update this resource`
      )
    );
  }

  if (!req.files?.imageFile) {
    return next(
      new HttpError(httpStatus.BAD_REQUEST, 'Please upload a photo.')
    );
  }

  const file = req.files.imageFile as UploadedFile;

  if (!file.mimetype.startsWith('image')) {
    return next(
      new HttpError(httpStatus.BAD_REQUEST, 'Please upload an image file.')
    );
  }
  if (file.size > 1 * 1024 * 1024) {
    return next(
      new HttpError(
        httpStatus.BAD_REQUEST,
        'File size should be less than 1MB.'
      )
    );
  }

  const fileName = `photo_${bootcamp._id}${path.extname(file.name)}`;

  file.mv(`./public/uploads/${fileName}`, async (err) => {
    if (err) {
      return next(
        new HttpError(httpStatus.INTERNAL_SERVER_ERROR, 'Upload failed')
      );
    }

    bootcamp.photo = fileName;
    await bootcamp.save();

    res.status(httpStatus.OK).json({ success: true, data: fileName });
  });
};
