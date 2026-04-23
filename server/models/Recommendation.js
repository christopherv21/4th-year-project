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

const warmupItemSchema = new mongoose.Schema(
  {
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
    note: {
      type: String,
      trim: true,
      default: "",
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
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    warmup: {
      type: [warmupItemSchema],
      default: [],
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