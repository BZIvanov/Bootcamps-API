const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Bootcamp = require('../models/bootcamp');

mongoose
  .connect(process.env.DB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((connection) => {
    console.log(
      `DB connection successful and ready for ${connection.connections[0].host}`
        .cyan.underline.bold
    );
  });

mongoose.connection.once('connected', async (err) => {
  if (err) {
    return console.log('DB connection error'.red.underline.bold, err);
  }

  try {
    const count = await Bootcamp.countDocuments();
    if (count > 0) {
      return;
    }

    const seedDataPath = path.join(__dirname, 'seed.json');
    const bootcamps = fs.readFileSync(seedDataPath, 'utf8');
    await Bootcamp.create(JSON.parse(bootcamps));
    console.log('Successfuly seeded data to DB'.green.bgGray.bold);
  } catch (error) {
    console.log('DB seed data error'.red.underline.bold, error);
  }
});
