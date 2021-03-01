const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
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
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: 'Bootcamp',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

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

module.exports = model('Course', schema);
