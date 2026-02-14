const Profile = require("../models/Profile");
const Exercise = require("../models/Exercise");
const Recommendation = require("../models/Recommendation");
const Feedback = require("../models/Feedback");

const pickRandom = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// POST /api/recommendations/generate  (or /generate depending on your routes)
const generateRecommendations = async (req, res) => {
  try {
    const { condition = "personalised" } = req.body || {};

    // 1) Read user profile
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Create /api/profile first." });
    }

    // 2) Get exercises from DB
    const exercises = await Exercise.find().lean();
    if (!exercises.length) {
      return res.status(400).json({ message: "No exercises found in database. Seed exercises first." });
    }

    // 3) Rule-based logic (v1)
    let sets = 3;
    let reps = 10;

    if (profile.fitnessLevel === "beginner") {
      sets = 3;
      reps = 12;
    } else if (profile.fitnessLevel === "intermediate") {
      sets = 4;
      reps = 10;
    } else {
      sets = 5;
      reps = 6;
    }

    const selected = pickRandom(exercises, 5);

    // 4) Generate workout
    const workout =
      condition === "baseline"
        ? {
            title: "Baseline Full Body Template",
            frequency: profile.daysPerWeek,
            exercises: [
              { name: "Squat", sets: 3, reps: 10 },
              { name: "Bench Press", sets: 3, reps: 10 },
              { name: "Row", sets: 3, reps: 12 },
              { name: "Plank", sets: 3, reps: "30s" },
            ],
            notes: "Non-personalised baseline",
          }
        : {
            title: `Personalised ${profile.goal} Workout`,
            frequency: profile.daysPerWeek,
            prescription: { sets, reps },
            exercises: selected.map((ex) => ({
              name: ex.name,
              sets,
              reps,
              kcalPerMinute: ex.kcalPerMinute,
              exerciseId: ex._id, // useful later
            })),
            notes: "Rule-based algorithm v1",
          };

    // 5) Save recommendation event
    const saved = await Recommendation.create({
      userId: req.userId,
      condition,
      algorithmVersion: "v1",
      workout,
    });

    return res.status(201).json(saved);
  } catch (err) {
    console.error("RECOMMENDATION ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/recommendations/today
const getTodayRecommendations = async (req, res) => {
  try {
    const userId = req.userId;

    // All exercises
    const allExercises = await Exercise.find().lean();
    if (allExercises.length === 0) return res.json([]);

    // User feedback logs
    const logs = await Feedback.find({ userId }).sort({ createdAt: -1 }).lean();

    // If no feedback yet -> recommend first 3–5
    if (!logs || logs.length === 0) {
      return res.json(allExercises.slice(0, 5));
    }

    // Prefer rating >= 4, avoid rating <= 2
    const goodIds = new Set(
      logs.filter((l) => (l.rating ?? 0) >= 4).map((l) => String(l.exerciseId))
    );
    const badIds = new Set(
      logs.filter((l) => (l.rating ?? 0) <= 2).map((l) => String(l.exerciseId))
    );

    // Pick liked exercises first
    let recommended = allExercises.filter((ex) => goodIds.has(String(ex._id)));

    // Fill remaining with neutral ones (not disliked)
    if (recommended.length < 3) {
      const fillers = allExercises.filter(
        (ex) => !goodIds.has(String(ex._id)) && !badIds.has(String(ex._id))
      );
      recommended = recommended.concat(fillers);
    }

    return res.json(recommended.slice(0, 5));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get today's recommendations", error: err.message });
  }
};

module.exports = {
  generateRecommendations,
  getTodayRecommendations,
};
