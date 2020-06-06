const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please provide a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  weeks: {
    type: Number,
    required: [true, 'Please provide number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please provide tuituin cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please provide minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scolarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
});

module.exports = mongoose.model('Course', schema);
