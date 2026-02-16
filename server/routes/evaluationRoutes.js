const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");

const { submitRecommendationFeedback } = require("../controllers/evaluationController");

router.post("/feedback", requireAuth, submitRecommendationFeedback);

module.exports = router;
