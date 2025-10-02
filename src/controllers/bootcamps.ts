import path from 'path';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { UploadedFile } from 'express-fileupload';
import Bootcamp, { IBootcamp } from '@/models/bootcamp.js';
import Filters from '@/utils/filters.js';
import { HttpError } from '@/utils/httpError.js';
import { userTypes } from '@/constants/user.js';
import { parseQuery } from '@/utils/parseQuery.js';

export const getBootcamps = async (req: Request, res: Response) => {
  const query = parseQuery(req.query);
  const filters = new Filters<IBootcamp>(
    Bootcamp.find().populate('courses'),
    query
  )
    .filter()
    .select()
    .sort()
    .paginate();

  const bootcamps = await filters.exec();

  const total = await Bootcamp.countDocuments();
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  res.status(httpStatus.OK).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: bootcamps,
  });
};

export const getBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(
      new HttpError(httpStatus.NOT_FOUND, `Bootcamp with id: ${id} not found`)
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: bootcamp });
};

export const createBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== userTypes.ADMIN) {
    return next(
      new HttpError(
        httpStatus.BAD_REQUEST,
        `User with id ${req.user.id} has already published a bootcamp`
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(httpStatus.CREATED).json({ success: true, data: bootcamp });
};

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
