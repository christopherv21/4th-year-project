const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const {
  generateBaselineWorkout,
  generatePersonalisedWorkout,
  getMyRecommendations,
} = require("../controllers/recommendationController");

router.post("/baseline", requireAuth, generateBaselineWorkout);
router.post("/personalised", requireAuth, generatePersonalisedWorkout);
router.get("/", requireAuth, getMyRecommendations);

module.exports = router;