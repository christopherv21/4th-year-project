const Profile = require("../models/Profile");
const Exercise = require("../models/Exercise");
const Recommendation = require("../models/Recommendation");
const Workout = require("../models/Workout");
const WorkoutExercise = require("../models/WorkoutExercise");

const pickRandom = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const pickOne = (arr, excludeIds = new Set(), avoidIds = new Set()) => {
  const filtered = arr.filter(
    (item) =>
      !excludeIds.has(String(item._id)) && !avoidIds.has(String(item._id))
  );

  if (filtered.length > 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  const fallback = arr.filter((item) => !excludeIds.has(String(item._id)));
  if (fallback.length === 0) return null;

  return fallback[Math.floor(Math.random() * fallback.length)];
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

const formatWorkoutExercises = (selectedExercises, sets, reps) => {
  return selectedExercises.map((exercise, index) => ({
    exerciseId: exercise._id,
    name: exercise.name,
    sets,
    reps,
    order: index + 1,
  }));
};

const uniquePush = (selected, exercise, seenIds) => {
  if (!exercise) return;
  const id = String(exercise._id);
  if (!seenIds.has(id)) {
    selected.push(exercise);
    seenIds.add(id);
  }
};

const fillRemainingExercises = (
  selected,
  allExercises,
  targetCount,
  seenIds,
  avoidIds = new Set()
) => {
  const preferred = allExercises.filter(
    (e) => !seenIds.has(String(e._id)) && !avoidIds.has(String(e._id))
  );

  while (selected.length < targetCount && preferred.length > 0) {
    const next = preferred.shift();
    uniquePush(selected, next, seenIds);
  }

  const fallback = allExercises.filter((e) => !seenIds.has(String(e._id)));
  while (selected.length < targetCount && fallback.length > 0) {
    const next = fallback.shift();
    uniquePush(selected, next, seenIds);
  }

  return selected;
};

const findByName = (
  arr,
  keywords,
  excludeIds = new Set(),
  avoidIds = new Set()
) => {
  return arr.find((item) => {
    const name = item.name.toLowerCase();
    const notUsed = !excludeIds.has(String(item._id));
    const notAvoided = !avoidIds.has(String(item._id));
    return (
      notUsed &&
      notAvoided &&
      keywords.some((keyword) => name.includes(keyword))
    );
  });
};

const buildWorkoutByGoal = ({
  goal,
  compound,
  posteriorChain,
  unilateral,
  isolation,
  calves,
  allExercises,
  exerciseCount,
  avoidIds = new Set(),
}) => {
  const selected = [];
  const seenIds = new Set();
  const { sets, reps } = getPrescription(goal);

  if (goal === "strength") {
    const mainCompound =
      findByName(
        compound,
        ["squat", "hack squat", "leg press"],
        seenIds,
        avoidIds
      ) || pickOne(compound, seenIds, avoidIds);

    const mainHinge =
      findByName(
        posteriorChain,
        ["deadlift", "rdl", "hip thrust"],
        seenIds,
        avoidIds
      ) || pickOne(posteriorChain, seenIds, avoidIds);

    const unilateralPattern =
      findByName(
        unilateral,
        ["split squat", "lunge", "step up"],
        seenIds,
        avoidIds
      ) || pickOne(unilateral, seenIds, avoidIds);

    const hamOrQuadIsolation =
      findByName(
        isolation,
        ["leg curl", "leg extension"],
        seenIds,
        avoidIds
      ) || pickOne(isolation, seenIds, avoidIds);

    const calfPattern = pickOne(calves, seenIds, avoidIds);

    uniquePush(selected, mainCompound, seenIds);
    uniquePush(selected, mainHinge, seenIds);
    uniquePush(selected, unilateralPattern, seenIds);
    uniquePush(selected, hamOrQuadIsolation, seenIds);
    uniquePush(selected, calfPattern, seenIds);
  }

  if (goal === "hypertrophy") {
    const compoundOne =
      findByName(
        compound,
        ["squat", "leg press", "hack squat"],
        seenIds,
        avoidIds
      ) || pickOne(compound, seenIds, avoidIds);

    const compoundTwo =
      findByName(
        posteriorChain,
        ["hip thrust", "rdl", "glute bridge"],
        seenIds,
        avoidIds
      ) || pickOne(posteriorChain, seenIds, avoidIds);

    const unilateralPattern =
      findByName(
        unilateral,
        ["walking lunge", "reverse lunge", "bulgarian", "split squat"],
        seenIds,
        avoidIds
      ) || pickOne(unilateral, seenIds, avoidIds);

    const quadIsolation =
      findByName(isolation, ["leg extension"], seenIds, avoidIds) ||
      pickOne(isolation, seenIds, avoidIds);

    const hamIsolation =
      findByName(isolation, ["leg curl", "hamstring curl"], seenIds, avoidIds) ||
      pickOne(isolation, seenIds, avoidIds);

    const calfPattern = pickOne(calves, seenIds, avoidIds);

    uniquePush(selected, compoundOne, seenIds);
    uniquePush(selected, compoundTwo, seenIds);
    uniquePush(selected, unilateralPattern, seenIds);
    uniquePush(selected, quadIsolation, seenIds);
    uniquePush(selected, hamIsolation, seenIds);
    uniquePush(selected, calfPattern, seenIds);
  }

  if (goal === "endurance") {
    const compoundOne =
      findByName(
        compound,
        ["leg press", "squat", "hack squat"],
        seenIds,
        avoidIds
      ) || pickOne(compound, seenIds, avoidIds);

    const unilateralOne =
      findByName(
        unilateral,
        ["walking lunge", "step up", "reverse lunge"],
        seenIds,
        avoidIds
      ) || pickOne(unilateral, seenIds, avoidIds);

    const posteriorOne =
      findByName(
        posteriorChain,
        ["glute bridge", "hip thrust", "rdl"],
        seenIds,
        avoidIds
      ) || pickOne(posteriorChain, seenIds, avoidIds);

    const isolationOne =
      findByName(
        isolation,
        ["leg extension", "leg curl"],
        seenIds,
        avoidIds
      ) || pickOne(isolation, seenIds, avoidIds);

    const calfPattern = pickOne(calves, seenIds, avoidIds);

    uniquePush(selected, compoundOne, seenIds);
    uniquePush(selected, unilateralOne, seenIds);
    uniquePush(selected, posteriorOne, seenIds);
    uniquePush(selected, isolationOne, seenIds);
    uniquePush(selected, calfPattern, seenIds);
  }

  fillRemainingExercises(selected, allExercises, exerciseCount, seenIds, avoidIds);

  return {
    label:
      goal === "strength"
        ? "Strength Option"
        : goal === "hypertrophy"
        ? "Hypertrophy Option"
        : "Endurance Option",
    description:
      goal === "strength"
        ? "A lower-body workout focused on strength development using lower reps and heavier training structure."
        : goal === "hypertrophy"
        ? "A lower-body workout focused on muscle growth using moderate reps and balanced training volume."
        : "A lower-body workout focused on muscular endurance using higher reps and more repeatable effort.",
    goal,
    prescription: { sets, reps },
    exercises: formatWorkoutExercises(
      selected.slice(0, exerciseCount),
      sets,
      reps
    ),
  };
};

const createWorkoutAndExercises = async ({
  userId,
  workoutType,
  title,
  sourceType,
  sourceName,
  sourceUrl = "",
  recommendationExercises,
}) => {
  const workout = await Workout.create({
    userId,
    workoutType,
    targetArea: "lower_body",
    title,
    sourceType,
    sourceName,
    sourceUrl,
  });

  await WorkoutExercise.insertMany(
    recommendationExercises.map((exercise, index) => ({
      workoutId: workout._id,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      sequenceNumber: exercise.order || index + 1,
      notes: "",
    }))
  );

  return workout;
};

const generateBaselineWorkout = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    const equipment = profile?.equipment;

    const exercises = equipment
      ? await Exercise.find({ equipment })
      : await Exercise.find({});

    if (exercises.length < 4) {
      return res.status(400).json({
        message: "Not enough exercises in database for a baseline workout.",
      });
    }

    const compound = exercises.filter((e) => e.category === "compound");
    const unilateral = exercises.filter((e) => e.category === "unilateral");
    const isolation = exercises.filter((e) => e.category === "isolation");
    const calves = exercises.filter((e) => e.category === "calves");

    const fallbackPool = [...exercises];
    const baselineSelected = [];

    const firstCompound =
      findByName(compound, ["squat", "leg press", "goblet squat"]) ||
      pickOne(compound);

    const secondMovement =
      findByName(unilateral, ["lunge", "split squat", "step up"]) ||
      pickOne(unilateral);

    const thirdMovement =
      findByName(isolation, ["leg extension", "leg curl"]) ||
      pickOne(isolation);

    const fourthMovement =
      pickOne(calves) ||
      findByName(fallbackPool, ["calf"]) ||
      pickRandom(fallbackPool, 1)[0];

    const seenIds = new Set();
    uniquePush(baselineSelected, firstCompound, seenIds);
    uniquePush(baselineSelected, secondMovement, seenIds);
    uniquePush(baselineSelected, thirdMovement, seenIds);
    uniquePush(baselineSelected, fourthMovement, seenIds);

    fillRemainingExercises(baselineSelected, fallbackPool, 4, seenIds);

    const recommendationExercises = baselineSelected
      .slice(0, 4)
      .map((exercise, index) => ({
        exerciseId: exercise._id,
        name: exercise.name,
        sets: 3,
        reps: "10-12",
        order: index + 1,
      }));

    const recommendation = await Recommendation.create({
      userId: req.userId,
      workoutType: "baseline",
      targetArea: "lower_body",
      title: "Generic Website Lower-Body Workout",
      sourceType: "baseline",
      sourceName: "Verywell Fit Beginner Leg Day Workout",
      sourceUrl: "https://www.verywellfit.com/beginner-leg-day-workout-5323162",
      exercises: recommendationExercises,
    });

    const workout = await createWorkoutAndExercises({
      userId: req.userId,
      workoutType: "baseline",
      title: "Generic Website Lower-Body Workout",
      sourceType: "baseline",
      sourceName: "Verywell Fit Beginner Leg Day Workout",
      sourceUrl: "https://www.verywellfit.com/beginner-leg-day-workout-5323162",
      recommendationExercises,
    });

    return res.status(201).json({
      ...recommendation.toObject(),
      workoutId: workout._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate baseline workout",
      error: error.message,
    });
  }
};

const generatePersonalisedWorkoutOptions = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found. Please complete your profile first.",
      });
    }

    const lastRecommendation = await Recommendation.findOne({
      userId: req.userId,
      workoutType: "personalised",
    }).sort({ createdAt: -1 });

    const lastExerciseIds = new Set(
      lastRecommendation?.exercises?.map((e) => String(e.exerciseId)) || []
    );

    const { fitnessLevel, equipment } = profile;
    const exerciseCount = getExerciseCount(fitnessLevel);

    const exercises = await Exercise.find({ equipment });

    if (exercises.length === 0) {
      return res.status(400).json({
        message: `No exercises found for equipment type: ${equipment}`,
      });
    }

    const compound = exercises.filter((e) => e.category === "compound");
    const posteriorChain = exercises.filter(
      (e) => e.category === "posterior_chain"
    );
    const unilateral = exercises.filter((e) => e.category === "unilateral");
    const isolation = exercises.filter((e) => e.category === "isolation");
    const calves = exercises.filter((e) => e.category === "calves");

    const workoutOptions = [
      buildWorkoutByGoal({
        goal: "strength",
        compound,
        posteriorChain,
        unilateral,
        isolation,
        calves,
        allExercises: exercises,
        exerciseCount,
        avoidIds: lastExerciseIds,
      }),
      buildWorkoutByGoal({
        goal: "hypertrophy",
        compound,
        posteriorChain,
        unilateral,
        isolation,
        calves,
        allExercises: exercises,
        exerciseCount,
        avoidIds: lastExerciseIds,
      }),
      buildWorkoutByGoal({
        goal: "endurance",
        compound,
        posteriorChain,
        unilateral,
        isolation,
        calves,
        allExercises: exercises,
        exerciseCount,
        avoidIds: lastExerciseIds,
      }),
    ];

    return res.status(200).json({
      workoutType: "personalised",
      targetArea: "lower_body",
      knowledgeBased: true,
      profileUsed: {
        fitnessLevel,
        equipment,
      },
      prescription: {
        exerciseCount,
        note: "Each option represents a different lower-body training goal.",
      },
      options: workoutOptions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate personalised workout options",
      error: error.message,
    });
  }
};

const createSelectedRecommendation = async (req, res) => {
  try {
    const { selectedWorkout } = req.body;

    if (!selectedWorkout || !Array.isArray(selectedWorkout.exercises)) {
      return res.status(400).json({
        message: "A selected workout option is required.",
      });
    }

    const goal = selectedWorkout.goal || "hypertrophy";

    const recommendation = await Recommendation.create({
      userId: req.userId,
      workoutType: "personalised",
      targetArea: "lower_body",
      title: selectedWorkout.label || `${goal} Lower-Body Workout`,
      sourceType: "recommender",
      sourceName: "Rule-Based Recommendation Engine",
      sourceUrl: "",
      exercises: selectedWorkout.exercises,
    });

    const workout = await createWorkoutAndExercises({
      userId: req.userId,
      workoutType: "personalised",
      title: selectedWorkout.label || `${goal} Lower-Body Workout`,
      sourceType: "recommender",
      sourceName: "Rule-Based Recommendation Engine",
      sourceUrl: "",
      recommendationExercises: selectedWorkout.exercises,
    });

    return res.status(201).json({
      ...recommendation.toObject(),
      workoutId: workout._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save selected workout recommendation",
      error: error.message,
    });
  }
};

const getMyRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(recommendations);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

module.exports = {
  generateBaselineWorkout,
  generatePersonalisedWorkoutOptions,
  createSelectedRecommendation,
  getMyRecommendations,
};