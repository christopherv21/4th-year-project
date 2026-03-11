const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recommendation",
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    suitabilityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    structureRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    difficultyFeedback: {
      type: String,
      enum: ["too_easy", "just_right", "too_hard"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);