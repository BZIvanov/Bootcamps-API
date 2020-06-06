const Bootcamp = require('../models/bootcamp');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getBootcamps = catchAsync(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, results: bootcamps.length, data: bootcamps });
});

exports.getBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp with id: ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

exports.createBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

exports.updateBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp with id: ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

exports.deleteBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp with id: ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({ success: true, data: null });
});
