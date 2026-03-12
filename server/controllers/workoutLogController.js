const WorkoutLog = require("../models/WorkoutLog");
const Recommendation = require("../models/Recommendation");

const normaliseOptionalRating = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const parsed = Number(value);

  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const logWorkout = async (req, res) => {
  try {
    const {
      recommendationId,
      completed,
      suitabilityRating,
      structureRating,
      enjoymentRating,
      difficultyFeedback,
      durationActual,
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

    // Ensure users can only log their own recommendation
    if (String(recommendation.userId) !== String(req.userId)) {
      return res.status(403).json({
        message: "You can only log workouts for your own recommendations",
      });
    }

    const payload = {
      userId: req.userId,
      recommendationId,
      completed,
      suitabilityRating: normaliseOptionalRating(suitabilityRating),
      structureRating: normaliseOptionalRating(structureRating),
      enjoymentRating: normaliseOptionalRating(enjoymentRating),
      difficultyFeedback: difficultyFeedback || "just_right",
      durationActual:
        durationActual === "" || durationActual === null || durationActual === undefined
          ? null
          : Number(durationActual),
      notes: typeof notes === "string" ? notes.trim() : "",
    };

    if (
      payload.durationActual !== null &&
      (Number.isNaN(payload.durationActual) || payload.durationActual < 0)
    ) {
      return res.status(400).json({
        message: "durationActual must be a valid number of minutes",
      });
    }

    // Upsert so feedback can be edited instead of creating duplicates
    const workoutLog = await WorkoutLog.findOneAndUpdate(
      { userId: req.userId, recommendationId },
      payload,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate("recommendationId");

    return res.status(200).json({
      message: "Workout feedback saved successfully",
      workoutLog,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A workout log already exists for this recommendation",
      });
    }

    return res.status(500).json({
      message: "Failed to log workout",
      error: error.message,
    });
  }
};

const getMyWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.userId })
      .populate("recommendationId")
      .sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch workout logs",
      error: error.message,
    });
  }
};

module.exports = {
  logWorkout,
  getMyWorkoutLogs,
};
