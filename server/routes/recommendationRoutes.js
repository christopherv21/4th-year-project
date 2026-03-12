const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const {
  generateBaselineWorkout,
  generatePersonalisedWorkoutOptions,
  createSelectedRecommendation,
  getMyRecommendations,
} = require("../controllers/recommendationController");

router.post("/baseline", requireAuth, generateBaselineWorkout);
router.post("/personalised-options", requireAuth, generatePersonalisedWorkoutOptions);
router.post("/personalised-select", requireAuth, createSelectedRecommendation);
router.get("/", requireAuth, getMyRecommendations);

module.exports = router;