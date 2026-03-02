const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    // User who received recommendation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Experimental condition (VERY IMPORTANT for evaluation)
    condition: {
      type: String,
      enum: ["baseline", "personalised"],
      required: true,
      default: "personalised",
    },

    // Algorithm version (useful for dissertation experiments)
    algorithmVersion: {
      type: String,
      default: "v1",
    },

    // Snapshot of user profile at recommendation time
    // (prevents data changing later and ruining evaluation)
    profileSnapshot: {
      fitnessLevel: String,
      goal: String,
      equipment: String,
      daysPerWeek: Number,
    },

    // Generated workout
    workout: {
      type: Object,
      required: true,
    },

    // Evaluation tracking
    completed: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    difficultyFeedback: {
      type: String,
      enum: ["easy", "appropriate", "hard"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);