const path = require('path');
const status = require('http-status');
const Bootcamp = require('../models/bootcamp');
const geocoder = require('../utils/geocoder');
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

  res.status(status.OK).json({
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
        status.NOT_FOUND
      )
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

exports.createBootcamp = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id ${req.user.id} has already published a bootcamp`,
        status.BAD_REQUEST
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(status.CREATED).json({ success: true, data: bootcamp });
});

exports.updateBootcamp = catchAsync(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.id} not found`,
        status.NOT_FOUND
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to update this resource`,
        status.UNAUTHORIZED
      )
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(status.OK).json({ success: true, data: bootcamp });
});

exports.deleteBootcamp = catchAsync(async (req, res, next) => {
  // findByIdAndDelete will not trigger schema middlewares, so here later remove method is used.
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.id} not found`,
        status.NOT_FOUND
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to delete this resource`,
        status.UNAUTHORIZED
      )
    );
  }

  // remove method is important to be used like this to trigger the pre method of the schema
  bootcamp.remove();

  res.status(status.OK).json({ success: true });
});

exports.getBootcampsInRadius = catchAsync(async (req, res) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  const EARTH_RADIUS_KM = 6378;
  const radius = distance / EARTH_RADIUS_KM;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(status.OK)
    .json({ success: true, results: bootcamps.length, data: bootcamps });
});

exports.bootcampPhotoUpload = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.id} not found`,
        status.NOT_FOUND
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to update this resource`,
        status.UNAUTHORIZED
      )
    );
  }

  if (!req.files) {
    return next(new AppError('Please upload a photo.', status.BAD_REQUEST));
  }

  const file = req.files.imageFile;

  if (!file.mimetype.startsWith('image')) {
    return next(
      new AppError('Please upload an image file.', status.BAD_REQUEST)
    );
  }
  if (file.size > 1000000) {
    return next(
      new AppError('File size should be less than 1MB.', status.BAD_REQUEST)
    );
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`./public/uploads/${file.name}`, async (err) => {
    if (err) {
      return next(new AppError('Upload failed', status.INTERNAL_SERVER_ERROR));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(status.OK).json({ success: true, data: file.name });
  });
});
