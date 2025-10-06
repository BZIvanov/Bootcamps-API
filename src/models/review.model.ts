import { Schema, model, Document, Model } from 'mongoose';
import { Models } from '@/constants/model.constants.js';
import Bootcamp from './bootcamp.model.js';

export interface IReview extends Document {
  title: string;
  text: string;
  rating: number;
  bootcamp: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
}

export interface IReviewModel extends Model<IReview> {
  getAverageRating(bootcampId: Schema.Types.ObjectId | string): Promise<void>;
}

const reviewSchema = new Schema<IReview>(
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

// one review per user only
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

reviewSchema.statics.getAverageRating = async function (
  bootcampId: Schema.Types.ObjectId | string
) {
  const agg = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageRating: { $avg: '$rating' } } },
  ]);

  try {
    if (agg.length > 0) {
      await Bootcamp.findByIdAndUpdate(bootcampId, {
        averageRating: agg[0].averageRating,
      });
    }
  } catch (err) {
    console.log('Review schema error: ', err);
  }
};

reviewSchema.post('save', function (this: IReview) {
  (this.constructor as IReviewModel).getAverageRating(this.bootcamp);
});

reviewSchema.pre(
  'deleteOne',
  { document: true, query: false },
  function (this: IReview, next) {
    (this.constructor as IReviewModel).getAverageRating(this.bootcamp);
    next();
  }
);

const Review = model<IReview, IReviewModel>(Models.REVIEW, reviewSchema);

export default Review;
