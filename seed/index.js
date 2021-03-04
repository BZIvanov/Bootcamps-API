const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
require('colors');
const User = require('../models/user');
const Bootcamp = require('../models/bootcamp');
const Course = require('../models/course');

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const seedData = async () => {
  try {
    const usersSeedDataPath = path.join(__dirname, 'users.json');
    const users = fs.readFileSync(usersSeedDataPath, 'utf8');
    await User.create(JSON.parse(users));

    const bootcampsSeedDataPath = path.join(__dirname, 'bootcamps.json');
    const bootcamps = fs.readFileSync(bootcampsSeedDataPath, 'utf8');
    await Bootcamp.create(JSON.parse(bootcamps));

    const coursesSeedDataPath = path.join(__dirname, 'courses.json');
    const courses = fs.readFileSync(coursesSeedDataPath, 'utf8');
    await Course.create(JSON.parse(courses));

    console.log('Successfuly seeded data to DB'.green.bgGray.bold);
    process.exit();
  } catch (error) {
    console.log('DB seed data error'.red.bgGray.bold, error);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Bootcamp.deleteMany();
    await Course.deleteMany();
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
