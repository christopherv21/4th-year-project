const mongoose = require("mongoose");

const WorkoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // For now this points to an Exercise
    recommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
      index: true,
    },

    completed: {
      type: Boolean,
      required: true,
      default: false,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// one log per user per exercise (prevents duplicates)
WorkoutLogSchema.index({ userId: 1, recommendationId: 1 }, { unique: true });

module.exports = mongoose.model("WorkoutLog", WorkoutLogSchema);
