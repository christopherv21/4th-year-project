const WorkoutLog = require("../models/WorkoutLog");
const Recommendation = require("../models/Recommendation");

const normaliseOptionalRating = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

const normaliseOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

const roundToTwo = (value) => Math.round(value * 100) / 100;

const averageFrom = (items, selector) => {
  const values = items
    .map(selector)
    .filter((value) => typeof value === "number" && !Number.isNaN(value));

  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  return roundToTwo(sum / values.length);
};

const percentage = (part, total) => {
  if (!total) {
    return 0;
  }

  return roundToTwo((part / total) * 100);
};

const buildSummary = (logs) => {
  const totalLogs = logs.length;
  const completedCount = logs.filter((log) => log.completed === true).length;

  const difficultyCounts = {
    just_right: 0,
    too_easy: 0,
    too_hard: 0,
  };

  logs.forEach((log) => {
    const key = log.difficultyFeedback || "just_right";

    if (difficultyCounts[key] !== undefined) {
      difficultyCounts[key] += 1;
    }
  });

  return {
    totalLogs,
    completedCount,
    completionRate: percentage(completedCount, totalLogs),

    avgSuitability: averageFrom(logs, (log) => log.suitabilityRating),
    avgStructure: averageFrom(logs, (log) => log.structureRating),
    avgEnjoyment: averageFrom(logs, (log) => log.enjoymentRating),
    avgDurationActual: averageFrom(logs, (log) => log.durationActual),

    difficultyCounts,
    difficultyPercentages: {
      just_right: percentage(difficultyCounts.just_right, totalLogs),
      too_easy: percentage(difficultyCounts.too_easy, totalLogs),
      too_hard: percentage(difficultyCounts.too_hard, totalLogs),
    },
  };
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
      return res.status(404).json({
        message: "Recommendation not found",
      });
    }

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
      durationActual: normaliseOptionalNumber(durationActual),
      notes: typeof notes === "string" ? notes.trim() : "",
    };

    if (payload.durationActual !== null && payload.durationActual < 0) {
      return res.status(400).json({
        message: "durationActual must be a valid number of minutes",
      });
    }

    const validDifficultyValues = ["too_easy", "just_right", "too_hard"];

    if (!validDifficultyValues.includes(payload.difficultyFeedback)) {
      return res.status(400).json({
        message: "difficultyFeedback must be too_easy, just_right, or too_hard",
      });
    }

    const ratingFields = [
      { key: "suitabilityRating", value: payload.suitabilityRating },
      { key: "structureRating", value: payload.structureRating },
      { key: "enjoymentRating", value: payload.enjoymentRating },
    ];

    for (const field of ratingFields) {
      if (field.value !== null && (field.value < 1 || field.value > 5)) {
        return res.status(400).json({
          message: `${field.key} must be between 1 and 5`,
        });
      }
    }

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

const getEvaluationSummary = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.userId })
      .populate("recommendationId")
      .sort({ updatedAt: -1, createdAt: -1 });

    const validLogs = logs.filter(
      (log) =>
        log.recommendationId &&
        log.recommendationId.workoutType === "personalised"
    );

    const summary = buildSummary(validLogs);

    const response = {
      overall: {
        totalLogs: validLogs.length,
      },
      personalised: summary,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch evaluation summary",
      error: error.message,
    });
  }
};

module.exports = {
  logWorkout,
  getMyWorkoutLogs,
  getEvaluationSummary,
};