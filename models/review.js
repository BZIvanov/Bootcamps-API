const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please provide review title'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please provide review text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// 1 review per user only
schema.index({ bootcamp: 1, user: 1 }, { unique: true });

schema.statics.getAverageRating = async function (bootcampId) {
  const agg = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: agg[0].averageRating,
    });
  } catch (err) {
    console.log('Review schema error: ', err);
  }
};

schema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

schema.pre('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', schema);
