const mongoose = require("mongoose");

const WorkoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ Link to Recommendation (NOT Exercise)
    recommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recommendation",
      required: true,
      index: true,
    },

    // ✅ Experimental condition stored directly on log
    // (makes history + metrics simpler and faster)
    condition: {
      type: String,
      enum: ["personalised", "baseline"],
      index: true,
    },

    // ✅ Workout completion (H1)
    completed: {
      type: Boolean,
      default: false,
    },

    // ✅ Suitability rating (H2)
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // ✅ Difficulty match feedback (H3)
    difficultyFeedback: {
      type: String,
      enum: ["easy", "appropriate", "hard"],
    },

    // Optional user comments
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Optional: time spent (future evaluation metric)
    durationMinutes: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

// ✅ one log per user per recommendation
WorkoutLogSchema.index({ userId: 1, recommendationId: 1 }, { unique: true });

module.exports = mongoose.model("WorkoutLog", WorkoutLogSchema);