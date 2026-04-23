const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    muscleGroup: {
      type: String,
      enum: ["quadriceps", "hamstrings", "glutes", "calves"],
      required: true,
    },
    category: {
      type: String,
      enum: ["compound", "posterior_chain", "unilateral", "isolation", "calves"],
      required: true,
    },
    equipment: {
      type: String,
      enum: ["gym", "dumbbells", "bodyweight"],
      required: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);