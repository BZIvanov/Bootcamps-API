import path from 'path';
import httpStatus from 'http-status';
import Bootcamp from '../models/bootcamp.js';
import Filters from '../utils/filters.js';
import { HttpError } from '../utils/httpError.js';
import { userTypes } from '../constants/user.js';

export const getBootcamps = async (req, res) => {
  const filtered = new Filters(Bootcamp.find().populate('courses'), req.query)
    .filter()
    .select()
    .sort()
    .paginate()
    .exec();
  const bootcamps = await filtered.docs;

  res.status(httpStatus.OK).json({
    success: true,
    results: bootcamps.length,
    data: bootcamps,
  });
};

export const getBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Bootcamp with id: ${req.params.id} not found`
      )
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: bootcamp });
};

export const createBootcamp = async (req, res, next) => {
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

export const updateBootcamp = async (req, res, next) => {
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

export const deleteBootcamp = async (req, res, next) => {
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

  // remove method is important to be used like this to trigger the pre method of the schema
  bootcamp.remove();

  res.status(httpStatus.OK).json({ success: true });
};

export const bootcampPhotoUpload = async (req, res, next) => {
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

  if (!req.files) {
    return next(
      new HttpError(httpStatus.BAD_REQUEST, 'Please upload a photo.')
    );
  }

  const file = req.files.imageFile;

  if (!file.mimetype.startsWith('image')) {
    return next(
      new HttpError(httpStatus.BAD_REQUEST, 'Please upload an image file.')
    );
  }
  if (file.size > 1000000) {
    return next(
      new HttpError(
        httpStatus.BAD_REQUEST,
        'File size should be less than 1MB.'
      )
    );
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`./public/uploads/${file.name}`, async (err) => {
    if (err) {
      return next(
        new HttpError(httpStatus.INTERNAL_SERVER_ERROR, 'Upload failed')
      );
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(httpStatus.OK).json({ success: true, data: file.name });
  });
};
