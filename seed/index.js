import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '../src/config/logger.js';
import User from '../src/models/user.js';
import Bootcamp from '../src/models/bootcamp.js';
import Course from '../src/models/course.js';
import Review from '../src/models/review.js';

dotenv.config();

mongoose
  .connect(process.env.DB_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => {
    logger.fatal('MongoDB connection error', { err });
    process.exit(1);
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readJSON = (fileName) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, fileName), 'utf-8'));

const seedData = async () => {
  try {
    logger.info('Seeding data to DB...');

    const bootcamps = readJSON('bootcamps.json');
    const courses = readJSON('courses.json');
    const users = readJSON('users.json');
    const reviews = readJSON('reviews.json');

    await Bootcamp.create(bootcamps);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await Course.create(courses);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await User.create(users);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await Review.create(reviews);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    logger.info('Successfully seeded data to DB');
    process.exit(0);
  } catch (err) {
    logger.fatal('DB seed data error', { err });
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await Review.deleteMany();

    logger.info('All documents deleted from DB');
    process.exit(0);
  } catch (err) {
    logger.fatal('DB delete error', { err });
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  seedData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
