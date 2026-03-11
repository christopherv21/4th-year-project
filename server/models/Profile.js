const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    goal: {
      type: String,
      enum: ["strength", "hypertrophy", "endurance"],
      required: true,
    },
    equipment: {
      type: String,
      enum: ["gym", "dumbbells", "bodyweight"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);