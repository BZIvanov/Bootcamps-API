const path = require('path');
const { status: httpStatus } = require('http-status');
const Bootcamp = require('../models/bootcamp');
const Filters = require('../utils/filters');
const AppError = require('../utils/appError');
const catchAsync = require('../middlewares/catch-async');
const {
  userTypes: { admin },
} = require('../constants');

exports.getBootcamps = catchAsync(async (req, res) => {
  const filtered = new Filters(Bootcamp.find().populate('courses'), req.query)
    .filter()
    .select()
    .sort()
    .paginate();
  const bootcamps = await filtered.docs;

  res.status(httpStatus.OK).json({
    success: true,
    results: bootcamps.length,
    data: bootcamps,
  });
});

exports.getBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: bootcamp });
});

exports.createBootcamp = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id ${req.user.id} has already published a bootcamp`,
        httpStatus.BAD_REQUEST
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(httpStatus.CREATED).json({ success: true, data: bootcamp });
});

exports.updateBootcamp = catchAsync(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to update this resource`,
        httpStatus.UNAUTHORIZED
      )
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.OK).json({ success: true, data: bootcamp });
});

exports.deleteBootcamp = catchAsync(async (req, res, next) => {
  // findByIdAndDelete will not trigger schema middlewares, so here later remove method is used.
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to delete this resource`,
        httpStatus.UNAUTHORIZED
      )
    );
  }

  // remove method is important to be used like this to trigger the pre method of the schema
  bootcamp.remove();

  res.status(httpStatus.OK).json({ success: true });
});

exports.bootcampPhotoUpload = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to update this resource`,
        httpStatus.UNAUTHORIZED
      )
    );
  }

  if (!req.files) {
    return next(new AppError('Please upload a photo.', httpStatus.BAD_REQUEST));
  }

  const file = req.files.imageFile;

  if (!file.mimetype.startsWith('image')) {
    return next(
      new AppError('Please upload an image file.', httpStatus.BAD_REQUEST)
    );
  }
  if (file.size > 1000000) {
    return next(
      new AppError('File size should be less than 1MB.', httpStatus.BAD_REQUEST)
    );
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`./public/uploads/${file.name}`, async (err) => {
    if (err) {
      return next(
        new AppError('Upload failed', httpStatus.INTERNAL_SERVER_ERROR)
      );
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(httpStatus.OK).json({ success: true, data: file.name });
  });
});
