const mongoose = require('mongoose');

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
