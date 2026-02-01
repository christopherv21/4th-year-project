// server/models/Exercise.js
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  kcalPerMinute: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
