const Feedback = require("../models/Feedback");

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.userId; // set by requireAuth middleware
    const { exerciseId, exerciseName, completed, rating, notes } = req.body;

    if (!exerciseId) return res.status(400).json({ message: "exerciseId is required" });
    if (!rating) return res.status(400).json({ message: "rating is required" });

    const doc = await Feedback.create({
      userId,
      exerciseId,
      exerciseName: exerciseName || "",
      completed: !!completed,
      rating: Number(rating),
      notes: notes || "",
      date: todayYYYYMMDD(),
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit feedback", error: err.message });
  }
};

exports.getEvaluationResults = async (req, res) => {
  try {
    const userId = req.userId;

    const logs = await Feedback.find({ userId }).lean();

    const totalLogs = logs.length;
    const completedCount = logs.filter(l => l.completed).length;
    const completionRate = totalLogs === 0 ? 0 : Math.round((completedCount / totalLogs) * 100);

    const avgRating =
      totalLogs === 0 ? 0 : (logs.reduce((sum, l) => sum + (l.rating || 0), 0) / totalLogs);

    res.json({
      totalLogs,
      completionRate,
      averageRating: Number(avgRating.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load summary", error: err.message });
  }
};
