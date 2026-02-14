const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },
    exerciseName: { type: String }, // optional, handy for demos

    completed: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5, required: true },
    notes: { type: String, default: "" },

    // optional but very useful for “today”
    date: { type: String, required: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
