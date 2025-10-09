import type { Document, Model } from 'mongoose';
import { Schema, model } from 'mongoose';
import Bootcamp from '@/modules/bootcamps/bootcamp.model.js';
import { USER_MODEL_NAME } from '@/modules/users/user.constants.js';
import { BOOTCAMP_MODEL_NAME } from '@/modules/bootcamps/bootcamp.constants.js';
import { COURSE_MODEL_NAME } from '@/modules/courses/course.constants.js';

export interface ICourse extends Document {
  title: string;
  description: string;
  weeks: number;
  tuition: number;
  minimumSkill: 'beginner' | 'intermediate' | 'advanced';
  bootcamp: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseModel extends Model<ICourse> {
  recalculateAverageCost(bootcampId: Schema.Types.ObjectId): Promise<void>;
}

const courseSchema = new Schema<ICourse, ICourseModel>(
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
      ref: BOOTCAMP_MODEL_NAME,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must be 10 or less'],
    },
  },
  { timestamps: true }
);

courseSchema.statics.recalculateAverageCost = async function (
  bootcampId: Schema.Types.ObjectId | string
) {
  const agg = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    if (agg.length > 0) {
      await Bootcamp.findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(agg[0].averageCost / 10) * 10,
      });
    }
  } catch (err) {
    console.log('Course schema error: ', err);
  }
};

// with the below 2 hooks we want to recalculate the average bootcamp price everytime we add or remove a course
courseSchema.post('save', function (this: ICourse) {
  (this.constructor as ICourseModel).recalculateAverageCost(this.bootcamp);
});

courseSchema.pre(
  'deleteOne',
  { document: true, query: false },
  function (this: ICourse, next) {
    (this.constructor as ICourseModel).recalculateAverageCost(this.bootcamp);
    next();
  }
);

courseSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: Record<string, any>) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Course = model<ICourse, ICourseModel>(COURSE_MODEL_NAME, courseSchema);

export default Course;
