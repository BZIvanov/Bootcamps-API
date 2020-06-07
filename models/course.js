const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please provide a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  weeks: {
    type: Number,
    required: [true, 'Please provide number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please provide tuituin cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please provide minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scolarshipAvailable: {
    type: Boolean,
    default: false,
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
});

schema.statics.getAverageCost = async function (bootcampId) {
  const agg = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(agg[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.log('Course schema error: ', err);
  }
};

schema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

schema.pre('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', schema);
