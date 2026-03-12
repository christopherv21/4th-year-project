const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const {
  logWorkout,
  getMyWorkoutLogs,
  getEvaluationSummary,
} = require("../controllers/workoutLogController");

router.post("/", requireAuth, logWorkout);
router.get("/", requireAuth, getMyWorkoutLogs);
router.get("/evaluation-summary", requireAuth, getEvaluationSummary);

module.exports = router;