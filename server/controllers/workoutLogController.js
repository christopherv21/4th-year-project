const WorkoutLog = require("../models/WorkoutLog");
const Recommendation = require("../models/Recommendation");

const logWorkout = async (req, res) => {
  try {
    const {
      recommendationId,
      completed,
      suitabilityRating,
      structureRating,
      difficultyFeedback,
      notes,
    } = req.body;

    if (!recommendationId || typeof completed !== "boolean") {
      return res.status(400).json({
        message: "recommendationId and completed are required",
      });
    }

    const recommendation = await Recommendation.findById(recommendationId);

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    const workoutLog = await WorkoutLog.create({
      userId: req.userId,
      recommendationId,
      completed,
      suitabilityRating,
      structureRating,
      difficultyFeedback,
      notes,
    });

    res.status(201).json(workoutLog);
  } catch (error) {
    res.status(500).json({
      message: "Failed to log workout",
      error: error.message,
    });
  }
};

const getMyWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.userId })
      .populate("recommendationId")
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch workout logs",
      error: error.message,
    });
  }
};

module.exports = {
  logWorkout,
  getMyWorkoutLogs,
};