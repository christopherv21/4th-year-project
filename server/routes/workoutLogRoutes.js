const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const {
  logWorkout,
  getMyWorkoutLogs,
} = require("../controllers/workoutLogController");

router.post("/", requireAuth, logWorkout);
router.get("/", requireAuth, getMyWorkoutLogs);

module.exports = router;
