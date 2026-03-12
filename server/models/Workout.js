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
      enum: ["baseline", "personalised"],
      required: true,
    },
    targetArea: {
      type: String,
      enum: ["lower_body"],
      default: "lower_body",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    sourceType: {
      type: String,
      enum: ["baseline", "recommender"],
      required: true,
    },
    sourceName: {
      type: String,
      trim: true,
      default: "",
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