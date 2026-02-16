const Feedback = require("../models/Feedback");
const Recommendation = require("../models/Recommendation");

// POST /api/evaluation/feedback
// Body: { recommendationId, completed, rating, notes }
const submitRecommendationFeedback = async (req, res) => {
  try {
    const { recommendationId, completed, rating, notes } = req.body || {};

    if (!recommendationId) {
      return res.status(400).json({ message: "recommendationId is required" });
    }

    // Ensure recommendation belongs to this user (prevents cheating / mixups)
    const rec = await Recommendation.findOne({ _id: recommendationId, userId: req.userId }).lean();
    if (!rec) {
      return res.status(404).json({ message: "Recommendation not found for this user" });
    }

    const doc = await Feedback.create({
      userId: req.userId,
      recommendationId,
      completed: !!completed,
      rating: typeof rating === "number" ? rating : null,
      notes: notes || "",
      // optional: store condition for faster evaluation queries
      condition: rec.condition,
      algorithmVersion: rec.algorithmVersion,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save feedback", error: err.message });
  }
};

module.exports = { submitRecommendationFeedback };
