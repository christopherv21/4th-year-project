const express = require("express");
const {
  getExercises,
  seedExercises,
} = require("../controllers/exerciseController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected: user must be logged in to see exercises
router.get("/", requireAuth, getExercises);

// Dev-only: seed exercises (can stay unprotected for now)
router.post("/seed", seedExercises);

module.exports = router;
