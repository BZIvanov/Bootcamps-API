import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '../src/config/logger.config.js';
import User from '../src/modules/users/user.model.js';
import Bootcamp from '../src/modules/bootcamps/bootcamp.model.js';
import Course from '../src/modules/courses/course.model.js';
import Review from '../src/modules/reviews/review.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readJSON = <T>(fileName: string): T =>
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
    logger.fatal({ err }, 'DB seed data error');
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
    logger.fatal({ err }, 'DB delete error');
    process.exit(1);
  }
};

const dbUri = process.env.DB_URI;
if (!dbUri) {
  throw new Error('DB_URI environment variable is missing');
}

const main = async () => {
  try {
    await mongoose.connect(dbUri);
    logger.info('MongoDB connected');

    if (process.argv[2] === '-i') {
      await seedData();
    } else if (process.argv[2] === '-d') {
      await deleteData();
    }

    process.exit(0);
  } catch (err) {
    logger.fatal({ err }, 'MongoDB connection error');
    process.exit(1);
  }
};

main();
