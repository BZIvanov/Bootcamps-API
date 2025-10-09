import type { Document, Model } from 'mongoose';
import { Schema, model } from 'mongoose';
import Course from '@/modules/courses/course.model.js';
import { REVIEW_MODEL_NAME } from '@/modules/reviews/review.constants.js';
import { USER_MODEL_NAME } from '@/modules/users/user.constants.js';
import { COURSE_MODEL_NAME } from '@/modules/courses/course.constants.js';

export interface IReview extends Document {
  title: string;
  text: string;
  rating: number;
  course: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends Model<IReview> {
  recalculateAverageRating(
    courseId: Schema.Types.ObjectId | string
  ): Promise<void>;
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
    course: {
      type: Schema.Types.ObjectId,
      ref: COURSE_MODEL_NAME,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
  },
  { timestamps: true }
);

// one review per user only
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

reviewSchema.statics.recalculateAverageRating = async function (
  courseId: Schema.Types.ObjectId | string
) {
  const agg = await this.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: '$course', averageRating: { $avg: '$rating' } } },
  ]);

  try {
    if (agg.length > 0) {
      await Course.findByIdAndUpdate(courseId, {
        averageRating: agg[0].averageRating.toFixed(1),
      });
    } else {
      await Course.findByIdAndUpdate(courseId, { averageRating: undefined });
    }
  } catch (err) {
    console.log('Review schema error: ', err);
  }
};

reviewSchema.post('save', function (this: IReview) {
  (this.constructor as IReviewModel).recalculateAverageRating(this.course);
});

reviewSchema.pre(
  'deleteOne',
  { document: true, query: false },
  function (this: IReview, next) {
    (this.constructor as IReviewModel).recalculateAverageRating(this.course);
    next();
  }
);

reviewSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: Record<string, any>) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Review = model<IReview, IReviewModel>(REVIEW_MODEL_NAME, reviewSchema);

export default Review;
