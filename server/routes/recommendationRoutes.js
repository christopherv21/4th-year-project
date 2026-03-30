const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const {
  generatePersonalisedWorkoutOptions,
  createSelectedRecommendation,
  getMyRecommendations,
} = require("../controllers/recommendationController");

router.post("/personalised-options", requireAuth, generatePersonalisedWorkoutOptions);
router.post("/personalised-select", requireAuth, createSelectedRecommendation);
router.get("/", requireAuth, getMyRecommendations);

module.exports = router;