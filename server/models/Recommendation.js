const mongoose = require("mongoose");

const recommendationExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
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
      default: "recommender",
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
    exercises: {
      type: [recommendationExerciseSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one exercise is required.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);