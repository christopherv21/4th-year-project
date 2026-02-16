const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const {
  generateRecommendations,
  getTodayRecommendations, // ✅ add
} = require("../controllers/recommendationController");

// existing route(s)
router.post("/generate", requireAuth, generateRecommendations);


// ✅ new route
router.get("/today", requireAuth, getTodayRecommendations);

module.exports = router;
