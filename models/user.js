const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

schema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', schema);
