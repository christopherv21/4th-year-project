const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");

const {
  submitRecommendationFeedback,
  getEvaluationMetrics,
} = require("../controllers/evaluationController");


// ------------------------------------
// Submit recommendation feedback
// (optional – if still used)
// ------------------------------------
router.post("/feedback", requireAuth, submitRecommendationFeedback);


// ------------------------------------
// Get evaluation metrics
// personalised vs baseline results
// ------------------------------------
router.get("/metrics", requireAuth, getEvaluationMetrics);


module.exports = router;