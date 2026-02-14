const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 profile per user
      index: true,
    },

    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    goal: {
      type: String,
      enum: ["strength", "hypertrophy", "endurance", "fat_loss"],
      required: true,
    },

    daysPerWeek: {
      type: Number,
      min: 1,
      max: 7,
      required: true,
    },

    equipment: {
      type: String,
      enum: ["gym", "home", "calisthenics", "mixed"],
      default: "mixed",
    },

    // optional but useful for your algorithm + evaluation
    heightCm: { type: Number, min: 50, max: 250 },
    weightKg: { type: Number, min: 20, max: 300 },
    injuriesNotes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
