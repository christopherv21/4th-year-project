const mongoose = require("mongoose");
const WorkoutLog = require("../models/WorkoutLog");

// POST /api/workouts/log
exports.createWorkoutLog = async (req, res) => {
  try {
    const userId = req.userId;
    const { recommendationId, completed, rating, notes } = req.body;

    if (!recommendationId || !mongoose.Types.ObjectId.isValid(recommendationId)) {
      return res
        .status(400)
        .json({ message: "Valid recommendationId (exercise id) is required." });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "completed must be boolean." });
    }

    if (rating !== undefined && rating !== null) {
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: "rating must be an integer 1–5." });
      }
    }

    const log = await WorkoutLog.create({
      userId,
      recommendationId,
      completed,
      rating: rating === undefined || rating === null ? undefined : Number(rating),
      notes,
    });

    return res.status(201).json(log);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already logged for this exercise." });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error creating workout log." });
  }
};

// GET /api/workouts/logs
exports.getMyLogs = async (req, res) => {
  try {
    const userId = req.userId;

    const logs = await WorkoutLog.find({ userId })
      .sort({ createdAt: -1 })
      .populate("recommendationId", "name kcalPerMinute");

    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error fetching logs." });
  }
};

// GET /api/workouts/metrics
exports.getMyMetrics = async (req, res) => {
  try {
    const userId = req.userId;

    const totalLogs = await WorkoutLog.countDocuments({ userId });
    const completedLogs = await WorkoutLog.countDocuments({ userId, completed: true });

    const ratingAgg = await WorkoutLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          rating: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    const avgRating = ratingAgg.length ? ratingAgg[0].avgRating : null;
    const ratingCount = ratingAgg.length ? ratingAgg[0].ratingCount : 0;

    const completionRate = totalLogs === 0 ? 0 : completedLogs / totalLogs;

    return res.json({
      totalLogs,
      completedLogs,
      completionRate,
      avgRating,
      ratingCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error computing metrics." });
  }
};
