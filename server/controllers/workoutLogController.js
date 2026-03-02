const mongoose = require("mongoose");
const WorkoutLog = require("../models/WorkoutLog");
const Recommendation = require("../models/Recommendation");

// POST /api/workouts/log
exports.createWorkoutLog = async (req, res) => {
  try {
    const userId = req.userId;
    const { recommendationId, completed, rating, notes, difficultyFeedback, durationMinutes } =
      req.body;

    if (!recommendationId || !mongoose.Types.ObjectId.isValid(recommendationId)) {
      return res.status(400).json({ message: "Valid recommendationId is required." });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return res.status(400).json({ message: "completed must be boolean." });
    }

    if (rating !== undefined && rating !== null) {
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: "rating must be an integer 1–5." });
      }
    }

    if (difficultyFeedback !== undefined && difficultyFeedback !== null) {
      const allowed = ["easy", "appropriate", "hard"];
      if (!allowed.includes(String(difficultyFeedback))) {
        return res.status(400).json({
          message: 'difficultyFeedback must be one of: "easy", "appropriate", "hard".',
        });
      }
    }

    if (durationMinutes !== undefined && durationMinutes !== null) {
      const d = Number(durationMinutes);
      if (!Number.isFinite(d) || d < 0) {
        return res.status(400).json({ message: "durationMinutes must be a number >= 0." });
      }
    }

    const getMyWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Failed to load workout logs" });
  }
};

module.exports = { getMyWorkoutLogs };

    // ✅ Ensure recommendation exists and belongs to this user
    const rec = await Recommendation.findOne({ _id: recommendationId, userId }).select("condition");
    if (!rec) {
      return res.status(404).json({ message: "Recommendation not found for this user." });
    }

    const log = await WorkoutLog.create({
      userId,
      recommendationId,

      // ✅ store the condition on the log (examiner-friendly, faster metrics)
      condition: rec.condition,

      completed: completed === undefined ? false : completed,
      rating: rating === undefined || rating === null ? undefined : Number(rating),
      difficultyFeedback:
        difficultyFeedback === undefined || difficultyFeedback === null
          ? undefined
          : String(difficultyFeedback),
      notes,
      durationMinutes:
        durationMinutes === undefined || durationMinutes === null ? undefined : Number(durationMinutes),
    });

    // Optional sync
    if (log.completed) {
      await Recommendation.findByIdAndUpdate(recommendationId, { completed: true });
    }

    return res.status(201).json(log);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Already logged for this recommendation." });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error creating workout log." });
  }
};

// PUT /api/workouts/log/:id
exports.updateWorkoutLog = async (req, res) => {
  try {
    const userId = req.userId;
    const logId = req.params.id;

    const { completed, rating, notes, difficultyFeedback, durationMinutes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return res.status(400).json({ message: "Valid log id is required." });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return res.status(400).json({ message: "completed must be boolean." });
    }

    if (rating !== undefined && rating !== null) {
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: "rating must be an integer 1–5." });
      }
    }

    if (difficultyFeedback !== undefined && difficultyFeedback !== null) {
      const allowed = ["easy", "appropriate", "hard"];
      if (!allowed.includes(String(difficultyFeedback))) {
        return res.status(400).json({
          message: 'difficultyFeedback must be one of: "easy", "appropriate", "hard".',
        });
      }
    }

    if (durationMinutes !== undefined && durationMinutes !== null) {
      const d = Number(durationMinutes);
      if (!Number.isFinite(d) || d < 0) {
        return res.status(400).json({ message: "durationMinutes must be a number >= 0." });
      }
    }

    const update = {
      ...(completed !== undefined ? { completed } : {}),
      ...(rating !== undefined ? { rating: rating === null ? undefined : Number(rating) } : {}),
      ...(difficultyFeedback !== undefined
        ? { difficultyFeedback: difficultyFeedback === null ? undefined : String(difficultyFeedback) }
        : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(durationMinutes !== undefined
        ? { durationMinutes: durationMinutes === null ? undefined : Number(durationMinutes) }
        : {}),
    };

    const log = await WorkoutLog.findOneAndUpdate({ _id: logId, userId }, update, {
      new: true,
      runValidators: true,
    });

    if (!log) {
      return res.status(404).json({ message: "Workout log not found." });
    }

    if (log.completed) {
      await Recommendation.findByIdAndUpdate(log.recommendationId, { completed: true });
    }

    return res.json(log);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error updating workout log." });
  }
};

// GET /api/workouts/logs
exports.getMyLogs = async (req, res) => {
  try {
    const userId = req.userId;

    const logs = await WorkoutLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("createdAt condition completed rating difficultyFeedback durationMinutes notes recommendationId");

    // ✅ return consistent shape (frontend-friendly)
    return res.json({ logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error fetching logs." });
  }
};

// GET /api/workouts/metrics  (personalised vs baseline)
exports.getMyMetrics = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // ✅ Use condition directly from WorkoutLog
    // Fallback for older logs that may not have condition saved yet.
    const grouped = await WorkoutLog.aggregate([
      { $match: { userId: userObjectId } },

      // If condition missing, attempt lookup from recommendation
      {
        $lookup: {
          from: "recommendations",
          localField: "recommendationId",
          foreignField: "_id",
          as: "rec",
        },
      },
      {
        $addFields: {
          rec: { $arrayElemAt: ["$rec", 0] },
        },
      },
      {
        $addFields: {
          effectiveCondition: {
            $ifNull: ["$condition", "$rec.condition"],
          },
        },
      },

      {
        $group: {
          _id: "$effectiveCondition",

          totalLogs: { $sum: 1 },
          completedLogs: { $sum: { $cond: ["$completed", 1, 0] } },

          avgRating: { $avg: "$rating" },

          ratingCount: {
            $sum: {
              $cond: [{ $ne: ["$rating", null] }, 1, 0],
            },
          },

          easy: { $sum: { $cond: [{ $eq: ["$difficultyFeedback", "easy"] }, 1, 0] } },
          appropriate: {
            $sum: { $cond: [{ $eq: ["$difficultyFeedback", "appropriate"] }, 1, 0] },
          },
          hard: { $sum: { $cond: [{ $eq: ["$difficultyFeedback", "hard"] }, 1, 0] } },
        },
      },

      {
        $addFields: {
          completionRate: {
            $cond: [{ $eq: ["$totalLogs", 0] }, 0, { $divide: ["$completedLogs", "$totalLogs"] }],
          },
        },
      },

      {
        $project: {
          _id: 0,
          condition: "$_id",
          totalLogs: 1,
          completedLogs: 1,
          completionRate: 1,
          avgRating: 1,
          ratingCount: 1,
          difficultyCounts: {
            easy: "$easy",
            appropriate: "$appropriate",
            hard: "$hard",
          },
        },
      },
      { $sort: { condition: 1 } },
    ]);

    const map = new Map(grouped.map((g) => [g.condition, g]));
    const ensure = (condition) =>
      map.get(condition) || {
        condition,
        totalLogs: 0,
        completedLogs: 0,
        completionRate: 0,
        avgRating: null,
        ratingCount: 0,
        difficultyCounts: { easy: 0, appropriate: 0, hard: 0 },
      };

    const personalised = ensure("personalised");
    const baseline = ensure("baseline");

    const totals = {
      totalLogs: personalised.totalLogs + baseline.totalLogs,
      completedLogs: personalised.completedLogs + baseline.completedLogs,
      completionRate:
        personalised.totalLogs + baseline.totalLogs === 0
          ? 0
          : (personalised.completedLogs + baseline.completedLogs) /
            (personalised.totalLogs + baseline.totalLogs),
    };

    return res.json({ personalised, baseline, totals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error computing metrics." });
  }
};