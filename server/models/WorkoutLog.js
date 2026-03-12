const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recommendation",
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    suitabilityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    structureRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    enjoymentRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    difficultyFeedback: {
      type: String,
      enum: ["too_easy", "just_right", "too_hard"],
      default: "just_right",
    },
    durationActual: {
      type: Number,
      min: 0,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent multiple logs for the same user + recommendation
workoutLogSchema.index({ userId: 1, recommendationId: 1 }, { unique: true });

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);
