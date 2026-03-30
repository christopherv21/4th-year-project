const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workoutType: {
      type: String,
      enum: ["personalised"],
      default: "personalised",
    },
    targetArea: {
      type: String,
      enum: ["lower_body"],
      default: "lower_body",
    },
    title: {
      type: String,
      trim: true,
      default: "Personalised Lower-Body Workout",
    },
    sourceType: {
      type: String,
      enum: ["recommender"],
      default: "recommender",
    },
    sourceName: {
      type: String,
      trim: true,
      default: "Rule-Based Recommendation Engine",
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);