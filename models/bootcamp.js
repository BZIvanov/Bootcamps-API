const { Schema, model } = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geocoder = require('../providers/geocoder');
const { Bootcamp, Course, User } = require('../constants');

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name should be at most 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description should be at most 500 characters'],
    },
    website: {
      type: String,
      validate: {
        validator: (value) =>
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
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
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

schema.pre('save', function generateSlug(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

schema.pre('save', async function generateLocation(next) {
  const [loc] = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc.longitude, loc.latitude],
    formattedAddress: loc.formattedAddress,
    street: loc.streetName,
    city: loc.city,
    state: loc.stateCode,
    zipcode: loc.zipcode,
    country: loc.countryCode,
  };

  this.address = undefined;

  next();
});

schema.pre('remove', async function deleteBootcampCourses(next) {
  await this.model(Course).deleteMany({ bootcamp: this._id });
  next();
});

// this is to get the courses for the bootcamp, when we request the bootcamp
schema.virtual('courses', {
  ref: Course,
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

module.exports = model(Bootcamp, schema);
