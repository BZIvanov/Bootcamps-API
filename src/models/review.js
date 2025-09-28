import { Schema, model } from 'mongoose';
import { Models } from '../constants/models.js';

const schema = new Schema(
  {
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

// 1 review per user only
schema.index({ bootcamp: 1, user: 1 }, { unique: true });

schema.statics.getAverageRating = async function averageRatingAggregation(
  bootcampId
) {
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
    await this.model(Models.BOOTCAMP).findByIdAndUpdate(bootcampId, {
      averageRating: agg[0].averageRating,
    });
  } catch (err) {
    console.log('Review schema error: ', err);
  }
};

schema.post('save', function averageRatingBeforeSave() {
  this.constructor.getAverageRating(this.bootcamp);
});

schema.pre('remove', function averageRatingBeforeRemove() {
  this.constructor.getAverageRating(this.bootcamp);
});

export default model(Models.REVIEW, schema);
