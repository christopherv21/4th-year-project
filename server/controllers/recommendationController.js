const Profile = require("../models/Profile");
const Exercise = require("../models/Exercise");
const Recommendation = require("../models/Recommendation");
const Feedback = require("../models/Feedback");

// Utility: random pick without mutating original
const pickRandom = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

/**
 * RULE-BASED ALGORITHM (v1)
 * Inputs (profile):
 *  - fitnessLevel: beginner | intermediate | advanced
 *  - goal: strength | hypertrophy | endurance
 *  - equipment: e.g. "gym", "bodyweight", "dumbbells" (must match Exercise schema values)
 * Output:
 *  - { sets, reps, filteredExercises }
 */
function applyRuleBasedV1(profile, exercises) {
  // ---------- RULE GROUP A: Fitness level -> base prescription ----------
  let sets;
  let reps;

  switch (profile.fitnessLevel) {
    case "beginner":
      sets = 3;
      reps = 15;
      break;
    case "intermediate":
      sets = 4;
      reps = 10;
      break;
    case "advanced":
      sets = 5;
      reps = 6;
      break;
    default:
      sets = 3;
      reps = 10;
  }

  // ---------- RULE GROUP B: Goal -> adjust prescription ----------
  if (profile.goal === "strength") {
    reps = Math.max(4, reps - 3);
    sets = Math.min(6, sets + 1);
  } else if (profile.goal === "endurance") {
    reps = reps + 5;
    sets = Math.max(2, sets - 1);
  } else if (profile.goal === "hypertrophy") {
    reps = Math.min(12, Math.max(8, reps));
  }

  // ---------- RULE GROUP C: Equipment -> filter exercise pool ----------
  let filteredExercises = exercises;

  if (profile.equipment && typeof profile.equipment === "string") {
    const eq = profile.equipment.trim().toLowerCase();

    filteredExercises = exercises.filter((ex) => {
      const exEq = (ex.equipment || "").toString().trim().toLowerCase();
      return exEq === eq;
    });

    // Fallback: if filtering returns none, don’t break the algorithm
    if (filteredExercises.length === 0) filteredExercises = exercises;
  }

  return { sets, reps, filteredExercises };
}

/**
 * POST /api/recommendations/generate
 * Body: { "condition": "baseline" | "personalised" }
 *
 * ✅ FIXED: This now ALWAYS respects the condition sent from the UI button.
 * ❌ No more auto-switching/alternation.
 */
const generateRecommendations = async (req, res) => {
  try {
    const requested = (req.body?.condition || "").toString().trim().toLowerCase();

    // ✅ Strict validation (prevents silent switching)
    if (requested !== "baseline" && requested !== "personalised") {
      return res.status(400).json({
        message: "Invalid condition. Use 'baseline' or 'personalised'.",
      });
    }

    const condition = requested;

    // 1) Read user profile
    const profile = await Profile.findOne({ userId: req.userId }).lean();
    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profile not found. Create /api/profile first." });
    }

    // 2) Get exercises from DB
    const exercises = await Exercise.find().lean();
    if (!exercises.length) {
      return res
        .status(400)
        .json({ message: "No exercises found in database. Seed exercises first." });
    }

    // 3) Baseline vs personalised
    let workout;

    if (condition === "baseline") {
      workout = {
        title: "Baseline Full Body Template",
        frequency: profile.daysPerWeek,
        exercises: [
          { name: "Squat", sets: 3, reps: 10 },
          { name: "Bench Press", sets: 3, reps: 10 },
          { name: "Row", sets: 3, reps: 12 },
          { name: "Plank", sets: 3, reps: "30s" },
        ],
        notes: "Non-personalised baseline",
      };
    } else {
      const { sets, reps, filteredExercises } = applyRuleBasedV1(profile, exercises);
      const selected = pickRandom(filteredExercises, 5);

      workout = {
        title: `Personalised ${profile.goal || "general"} Workout`,
        frequency: profile.daysPerWeek,
        inputsUsed: {
          fitnessLevel: profile.fitnessLevel,
          goal: profile.goal,
          daysPerWeek: profile.daysPerWeek,
          equipment: profile.equipment || null,
        },
        prescription: { sets, reps },
        exercises: selected.map((ex) => ({
          name: ex.name,
          sets,
          reps,
          kcalPerMinute: ex.kcalPerMinute,
          exerciseId: ex._id,
          equipment: ex.equipment || null,
        })),
        notes: "Rule-based algorithm v1 (explicit rules: fitnessLevel + goal + equipment filter)",
      };
    }

    // 4) Save recommendation event (evaluation-ready record)
    const saved = await Recommendation.create({
      userId: req.userId,
      condition,
      algorithmVersion: "rule-based-v1",
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
    if (!allExercises.length) return res.json([]);

    // User feedback logs
    const logs = await Feedback.find({ userId }).sort({ createdAt: -1 }).lean();

    // If no feedback yet -> recommend first 5
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
    return res
      .status(500)
      .json({ message: "Failed to get today's recommendations", error: err.message });
  }
};

module.exports = {
  generateRecommendations,
  getTodayRecommendations,
};