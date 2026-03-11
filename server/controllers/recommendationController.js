const Profile = require("../models/Profile");
const Exercise = require("../models/Exercise");
const Recommendation = require("../models/Recommendation");

const pickRandom = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const pickOne = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

const getPrescription = (goal) => {
  switch (goal) {
    case "strength":
      return { sets: 4, reps: "4-6" };
    case "hypertrophy":
      return { sets: 3, reps: "8-12" };
    case "endurance":
      return { sets: 2, reps: "12-15" };
    default:
      return { sets: 3, reps: "8-12" };
  }
};

const getExerciseCount = (fitnessLevel) => {
  switch (fitnessLevel) {
    case "beginner":
      return 4;
    case "intermediate":
      return 5;
    case "advanced":
      return 6;
    default:
      return 4;
  }
};

const formatWorkoutExercises = (selectedExercises, sets, reps) => {
  return selectedExercises.map((exercise, index) => ({
    exerciseId: exercise._id,
    name: exercise.name,
    sets,
    reps,
    order: index + 1,
  }));
};

const generateBaselineWorkout = async (req, res) => {
  try {
    const exercises = await Exercise.find({});

    if (exercises.length < 4) {
      return res.status(400).json({
        message: "Not enough exercises in database. Seed exercises first.",
      });
    }

    const selected = pickRandom(exercises, 4);

    const recommendation = await Recommendation.create({
      userId: req.userId,
      workoutType: "baseline",
      targetArea: "lower_body",
      exercises: selected.map((exercise, index) => ({
        exerciseId: exercise._id,
        name: exercise.name,
        sets: 3,
        reps: "10",
        order: index + 1,
      })),
    });

    res.status(201).json(recommendation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate baseline workout",
      error: error.message,
    });
  }
};

const generatePersonalisedWorkout = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found. Please complete your profile first.",
      });
    }

    const { fitnessLevel, goal, equipment } = profile;
    const { sets, reps } = getPrescription(goal);
    const exerciseCount = getExerciseCount(fitnessLevel);

    const exercises = await Exercise.find({ equipment });

    if (exercises.length === 0) {
      return res.status(400).json({
        message: `No exercises found for equipment type: ${equipment}`,
      });
    }

    const compound = exercises.filter((e) => e.category === "compound");
    const posteriorChain = exercises.filter((e) => e.category === "posterior_chain");
    const unilateral = exercises.filter((e) => e.category === "unilateral");
    const isolation = exercises.filter((e) => e.category === "isolation");
    const calves = exercises.filter((e) => e.category === "calves");

    const selected = [];

    const mainCompound = pickOne(compound);
    const posterior = pickOne(posteriorChain);
    const uni = pickOne(unilateral);
    const iso = pickOne(isolation);
    const calf = pickOne(calves);

    if (mainCompound) selected.push(mainCompound);
    if (posterior) selected.push(posterior);
    if (uni) selected.push(uni);
    if (iso) selected.push(iso);
    if (calf && selected.length < exerciseCount) selected.push(calf);

    const uniqueSelected = [];
    const seenIds = new Set();

    for (const ex of selected) {
      if (ex && !seenIds.has(String(ex._id))) {
        uniqueSelected.push(ex);
        seenIds.add(String(ex._id));
      }
    }

    const remaining = exercises.filter((e) => !seenIds.has(String(e._id)));

    while (uniqueSelected.length < exerciseCount && remaining.length > 0) {
      const next = remaining.shift();
      uniqueSelected.push(next);
      seenIds.add(String(next._id));
    }

    const recommendation = await Recommendation.create({
      userId: req.userId,
      workoutType: "personalised",
      targetArea: "lower_body",
      exercises: formatWorkoutExercises(uniqueSelected, sets, reps),
    });

    res.status(201).json(recommendation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate personalised workout",
      error: error.message,
    });
  }
};

const getMyRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

module.exports = {
  generateBaselineWorkout,
  generatePersonalisedWorkout,
  getMyRecommendations,
};