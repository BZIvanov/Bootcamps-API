import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import 'colors';
import User from '../models/user.js';
import Bootcamp from '../models/bootcamp.js';
import Course from '../models/course.js';
import Review from '../models/review.js';

dotenv.config();

mongoose.connect(process.env.DB_URI);

const seedData = async () => {
  try {
    console.log('Seeding data...'.blue.bgBlack.bold);

    const bootcamps = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'bootcamps.json'), 'utf-8')
    );

    const courses = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8')
    );

    const users = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8')
    );

    const reviews = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf-8')
    );

    await Bootcamp.create(bootcamps);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await Course.create(courses);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await User.create(users);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await Review.create(reviews);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Successfuly seeded data to DB'.green.bgGray.bold);
    process.exit();
  } catch (error) {
    console.log('DB seed data error'.red.bgGray.bold, error);
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await Review.deleteMany();

    console.log('All documents were deleted.'.green.bgGray.bold);
    process.exit();
  } catch (error) {
    console.log('DB seed data error'.red.bgGray.bold, error);
  }
};

if (process.argv[2] === '-i') {
  seedData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
