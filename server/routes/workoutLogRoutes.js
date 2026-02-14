const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");

const {
  createWorkoutLog,
  getMyLogs,
  getMyMetrics
} = require("../controllers/workoutLogController");

router.post("/log", requireAuth, createWorkoutLog);
router.get("/logs", requireAuth, getMyLogs);
router.get("/metrics", requireAuth, getMyMetrics);

module.exports = router;
