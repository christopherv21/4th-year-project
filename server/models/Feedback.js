const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ Recommendation-level evaluation (required)
    recommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recommendation",
      required: true,
    },

    // ✅ Optional: keep per-exercise feedback support
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: false,
    },

    exerciseName: { type: String, default: "" },

    // Outcome metrics
    completed: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5, required: true },
    notes: { type: String, default: "" },

    // ✅ Auto date (no more manual required field)
    date: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10), // "YYYY-MM-DD"
    },

    // ✅ Optional but handy for evaluation queries without extra joins
    condition: { type: String, enum: ["baseline", "personalised"], default: "personalised" },
    algorithmVersion: { type: String, default: "rule-based-v1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
