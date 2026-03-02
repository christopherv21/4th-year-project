const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");

const {
  createWorkoutLog,
  updateWorkoutLog,
  getMyLogs,
  getMyMetrics,
} = require("../controllers/workoutLogController");


// ========================================
// WORKOUT LOG ROUTES (Protected)
// ========================================

// ✅ Submit feedback (ONE log per recommendation)
router.post("/log", requireAuth, createWorkoutLog);


// ✅ Update existing feedback (optional editing)
router.put("/log/:id", requireAuth, updateWorkoutLog);


// ✅ Workout history (used by WorkoutHistory.jsx)
router.get("/logs", requireAuth, getMyLogs);


// ✅ Evaluation metrics (used by EvaluationResults.jsx)
router.get("/metrics", requireAuth, getMyMetrics);


module.exports = router;