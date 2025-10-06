import { Schema, model, Document } from 'mongoose';
import validator from 'validator';
import { requireCJS } from '@/utils/cjsRequire.util.js';
import { Models } from '@/constants/model.constants.js';
import Course from './course.model.js';

const slugify = requireCJS('slugify');

export interface IBootcamp extends Document {
  name: string;
  slug: string;
  description: string;
  website?: string;
  phone?: string;
  address: string;
  careers: string[];
  averageRating?: number;
  averageCost?: number;
  photo: string;
  user: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bootcampSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name should be at most 50 characters'],
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description should be at most 500 characters'],
    },
    website: {
      type: String,
      validate: {
        validator: (value: string) =>
          validator.isURL(value, {
            protocols: ['http', 'https'],
            require_tld: true,
            require_protocol: true,
          }),
        message: 'Must be a Valid URL',
      },
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number should be at most 20 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must be 10 or less'],
    },
    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: Models.USER,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

bootcampSchema.pre<IBootcamp>('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

bootcampSchema.pre<IBootcamp>(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    try {
      await Course.deleteMany({ bootcamp: this._id });
      next();
    } catch (err) {
      next(err as Error);
    }
  }
);

// this is to get the courses for the bootcamp, when we request the bootcamp
bootcampSchema.virtual('courses', {
  ref: Models.COURSE,
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

const Bootcamp = model<IBootcamp>(Models.BOOTCAMP, bootcampSchema);

export default Bootcamp;
