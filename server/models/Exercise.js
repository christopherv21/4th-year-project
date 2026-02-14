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

  // optional fields for recommendation filtering (v2 upgrade)
  muscleGroup: {
    type: String,
    default: "general"
  },

  equipment: {
    type: String,
    default: "gym"
  },

  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner"
  }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
