import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/modules/users/user.model.js';
import Bootcamp from '../src/modules/bootcamps/bootcamp.model.js';
import Course from '../src/modules/courses/course.model.js';
import Review from '../src/modules/reviews/review.model.js';

const basePath = path.resolve(process.cwd());
const envFileName = '.env.development';
const envPath = path.join(basePath, envFileName);

dotenv.config({ path: envPath });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readJSON = <T>(fileName: string): T =>
  JSON.parse(fs.readFileSync(path.join(__dirname, fileName), 'utf-8'));

const seedData = async () => {
  try {
    console.log('Seeding data to DB...');

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

    console.log('Successfully seeded data to DB');
    process.exit(0);
  } catch (err) {
    console.error('DB seed data error', err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await Review.deleteMany();

    console.log('All documents deleted from DB');
    process.exit(0);
  } catch (err) {
    console.error('DB delete error', err);
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
    console.log('MongoDB connected');

    if (process.argv[2] === '-i') {
      await seedData();
    } else if (process.argv[2] === '-d') {
      await deleteData();
    }

    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
};

main();
