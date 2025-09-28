import { Schema, model } from 'mongoose';
import { Models } from '../constants/models.js';

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
      required: [true, 'Please provide tuition cost'],
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please provide minimum skill'],
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: Models.BOOTCAMP,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: Models.USER,
      required: true,
    },
  },
  { timestamps: true }
);

schema.statics.getAverageCost = async function averageCostAggregation(
  bootcampId
) {
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
    await this.model(Models.BOOTCAMP).findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(agg[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.log('Course schema error: ', err);
  }
};

// with the below 2 hooks we want to recalculate the average bootcamp price everytime we add or remove a course
schema.post('save', function averageCostBeforeSave() {
  this.constructor.getAverageCost(this.bootcamp);
});
schema.pre('remove', function averageCostBeforeRemove() {
  this.constructor.getAverageCost(this.bootcamp);
});

export default model(Models.COURSE, schema);
