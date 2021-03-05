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
    const bootcamps = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'bootcamps.json'), 'utf-8')
    );

    const courses = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8')
    );

    const users = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8')
    );

    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);

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
