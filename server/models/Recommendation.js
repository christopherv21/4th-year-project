const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    condition: {
      type: String,
      enum: ["baseline", "personalised"],
      default: "personalised",
    },

    algorithmVersion: { type: String, default: "v1" },

    workout: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
