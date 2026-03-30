const Profile = require("../models/Profile");
const Exercise = require("../models/Exercise");
const Recommendation = require("../models/Recommendation");
const Workout = require("../models/Workout");
const WorkoutExercise = require("../models/WorkoutExercise");

// Pick one exercise while avoiding duplicates and recently used ones
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

// Decide how many exercises based on fitness level and age
const getExerciseCount = (fitnessLevel, age) => {
  let count = 4;

  switch (fitnessLevel) {
    case "beginner":
      count = 4;
      break;
    case "intermediate":
      count = 5;
      break;
    case "advanced":
      count = 6;
      break;
    default:
      count = 4;
  }

  if (age >= 60) {
    return Math.max(4, count - 1);
  }

  return count;
};

// Decide sets/reps based on goal, with safer adjustments for age/injury
const getPrescription = (goal, age, injury) => {
  let prescription;

  switch (goal) {
    case "strength":
      prescription = { sets: 4, reps: "4-6" };
      break;
    case "hypertrophy":
      prescription = { sets: 3, reps: "8-12" };
      break;
    case "endurance":
      prescription = { sets: 2, reps: "12-15" };
      break;
    default:
      prescription = { sets: 3, reps: "8-12" };
  }

  if (age >= 50 || injury !== "none") {
    if (goal === "strength") {
      return { sets: 3, reps: "6-8" };
    }

    if (goal === "endurance") {
      return { sets: 2, reps: "12-15" };
    }

    return { sets: 2, reps: "10-12" };
  }

  return prescription;
};

// Convert exercises into the format used by Recommendation
const formatWorkoutExercises = (selectedExercises, sets, reps) => {
  return selectedExercises.map((exercise, index) => ({
    exerciseId: exercise._id,
    name: exercise.name,
    sets,
    reps,
    order: index + 1,
  }));
};

// Push exercise only if not already used
const uniquePush = (selected, exercise, seenIds) => {
  if (!exercise) return;

  const id = String(exercise._id);

  if (!seenIds.has(id)) {
    selected.push(exercise);
    seenIds.add(id);
  }
};

// Fill remaining workout slots
const fillRemainingExercises = (
  selected,
  allExercises,
  targetCount,
  seenIds,
  avoidIds = new Set()
) => {
  const preferred = allExercises.filter(
    (exercise) =>
      !seenIds.has(String(exercise._id)) &&
      !avoidIds.has(String(exercise._id))
  );

  while (selected.length < targetCount && preferred.length > 0) {
    const next = preferred.shift();
    uniquePush(selected, next, seenIds);
  }

  const fallback = allExercises.filter(
    (exercise) => !seenIds.has(String(exercise._id))
  );

  while (selected.length < targetCount && fallback.length > 0) {
    const next = fallback.shift();
    uniquePush(selected, next, seenIds);
  }

  return selected;
};

// Find an exercise by name keywords
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

// Decide if exercise should be excluded for safety / suitability
const shouldExcludeExercise = (exercise, profile) => {
  const name = exercise.name.toLowerCase();
  const { injury = "none", age = 18, fitnessLevel = "beginner" } = profile;

  const highImpactKeywords = ["jump", "plyo", "explosive"];
  const kneeSensitiveKeywords = [
    "lunge",
    "split squat",
    "bulgarian",
    "step up",
    "curtsy",
  ];
  const backSensitiveKeywords = [
    "deadlift",
    "good morning",
    "single leg romanian deadlift",
    "rdl",
  ];
  const veryDemandingBeginnerKeywords = [
    "bulgarian",
    "single leg romanian deadlift",
  ];

  if (age >= 50 && highImpactKeywords.some((keyword) => name.includes(keyword))) {
    return true;
  }

  if (
    fitnessLevel === "beginner" &&
    age >= 50 &&
    veryDemandingBeginnerKeywords.some((keyword) => name.includes(keyword))
  ) {
    return true;
  }

  if (injury === "knee") {
    if (highImpactKeywords.some((keyword) => name.includes(keyword))) {
      return true;
    }

    if (kneeSensitiveKeywords.some((keyword) => name.includes(keyword))) {
      return true;
    }
  }

  if (injury === "back") {
    if (backSensitiveKeywords.some((keyword) => name.includes(keyword))) {
      return true;
    }
  }

  return false;
};

// Return only safe exercises
const getSafeExercises = (exercises, profile) => {
  return exercises.filter((exercise) => !shouldExcludeExercise(exercise, profile));
};

const getWorkoutLabel = (goal) => {
  if (goal === "strength") return "Strength-Focused Lower Body";
  if (goal === "hypertrophy") return "Muscle-Building Lower Body";
  return "Endurance-Focused Lower Body";
};

const getWorkoutDescription = (goal) => {
  if (goal === "strength") {
    return "A lower-body workout focused on strength development using lower repetitions, controlled exercise selection, and a compound-first structure.";
  }

  if (goal === "hypertrophy") {
    return "A lower-body workout focused on muscle growth using moderate repetitions, balanced exercise variety, and structured lower-body coverage.";
  }

  return "A lower-body workout focused on muscular endurance using higher repetitions, repeatable effort, and manageable lower-body training volume.";
};

const buildReasonText = ({ profile, goal, exerciseCount, selected }) => {
  const parts = [];

  parts.push(
    `Generated for a ${profile.fitnessLevel} user with a ${goal} goal.`
  );

  parts.push(
    `${exerciseCount} exercises were selected based on the user's available equipment (${profile.equipment}).`
  );

  if (profile.age >= 50) {
    parts.push("Age-aware adjustments were applied to support safer volume and exercise selection.");
  }

  if (profile.injury && profile.injury !== "none") {
    parts.push(
      `Injury-aware filtering was applied to reduce exercises that may aggravate a ${profile.injury} issue.`
    );
  }

  parts.push(
    "The workout follows a rule-based structure that prioritises compound movements first, then balances posterior-chain, unilateral, isolation, and calf work where possible."
  );

  if (selected.length > 0) {
    parts.push(
      `Selected exercises include ${selected
        .slice(0, 3)
        .map((exercise) => exercise.name)
        .join(", ")}${selected.length > 3 ? ", and others" : ""}.`
    );
  }

  return parts.join(" ");
};

// Build one workout option by goal
const buildWorkoutByGoal = ({
  goal,
  compound,
  posteriorChain,
  unilateral,
  isolation,
  calves,
  allExercises,
  exerciseCount,
  profile,
  avoidIds = new Set(),
}) => {
  const selected = [];
  const seenIds = new Set();
  const { sets, reps } = getPrescription(goal, profile.age, profile.injury);

  if (goal === "strength") {
    const mainCompound =
      findByName(
        compound,
        ["squat", "hack squat", "leg press", "goblet squat"],
        seenIds,
        avoidIds
      ) || pickOne(compound, seenIds, avoidIds);

    const mainHinge =
      findByName(
        posteriorChain,
        ["hip thrust", "glute bridge", "rdl", "deadlift"],
        seenIds,
        avoidIds
      ) || pickOne(posteriorChain, seenIds, avoidIds);

    const unilateralPattern =
      findByName(
        unilateral,
        ["step up", "reverse lunge", "split squat", "lunge"],
        seenIds,
        avoidIds
      ) || pickOne(unilateral, seenIds, avoidIds);

    const hamOrQuadIsolation =
      findByName(
        isolation,
        ["leg curl", "hamstring curl", "leg extension", "glute kickback"],
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
        ["squat", "leg press", "hack squat", "goblet squat"],
        seenIds,
        avoidIds
      ) || pickOne(compound, seenIds, avoidIds);

    const compoundTwo =
      findByName(
        posteriorChain,
        ["hip thrust", "rdl", "glute bridge", "dumbbell hip thrust"],
        seenIds,
        avoidIds
      ) || pickOne(posteriorChain, seenIds, avoidIds);

    const unilateralPattern =
      findByName(
        unilateral,
        ["walking lunge", "reverse lunge", "bulgarian", "split squat", "step up"],
        seenIds,
        avoidIds
      ) || pickOne(unilateral, seenIds, avoidIds);

    const quadIsolation =
      findByName(
        isolation,
        ["leg extension", "wall sit", "glute kickback"],
        seenIds,
        avoidIds
      ) || pickOne(isolation, seenIds, avoidIds);

    const hamIsolation =
      findByName(
        isolation,
        ["leg curl", "hamstring curl", "frog pumps"],
        seenIds,
        avoidIds
      ) || pickOne(isolation, seenIds, avoidIds);

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
        ["leg press", "squat", "goblet squat", "bodyweight squat"],
        seenIds,
        avoidIds
      ) || pickOne(compound, seenIds, avoidIds);

    const unilateralOne =
      findByName(
        unilateral,
        ["step up", "reverse lunge", "walking lunge"],
        seenIds,
        avoidIds
      ) || pickOne(unilateral, seenIds, avoidIds);

    const posteriorOne =
      findByName(
        posteriorChain,
        ["glute bridge", "hip thrust", "rdl", "dumbbell hip thrust"],
        seenIds,
        avoidIds
      ) || pickOne(posteriorChain, seenIds, avoidIds);

    const isolationOne =
      findByName(
        isolation,
        ["leg extension", "leg curl", "wall sit", "frog pumps", "hamstring curl"],
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
    label: getWorkoutLabel(goal),
    description: getWorkoutDescription(goal),
    goal,
    prescription: { sets, reps },
    reason: buildReasonText({
      profile,
      goal,
      exerciseCount,
      selected: selected.slice(0, exerciseCount),
    }),
    exercises: formatWorkoutExercises(selected.slice(0, exerciseCount), sets, reps),
  };
};

// Save a workout and its workout-exercise rows
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

// Generate 3 personalised options
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
      lastRecommendation?.exercises?.map((exercise) => String(exercise.exerciseId)) || []
    );

    const { fitnessLevel, equipment, goal, age, injury } = profile;
    const exerciseCount = getExerciseCount(fitnessLevel, age);

    const exercises = await Exercise.find({ equipment });

    if (exercises.length === 0) {
      return res.status(400).json({
        message: `No exercises found for equipment type: ${equipment}`,
      });
    }

    const safeExercises = getSafeExercises(exercises, profile);

    if (safeExercises.length < 3) {
      return res.status(400).json({
        message:
          "Not enough suitable exercises found for this profile. Try another equipment type or broaden the exercise database.",
      });
    }

    const compound = safeExercises.filter((exercise) => exercise.category === "compound");
    const posteriorChain = safeExercises.filter(
      (exercise) => exercise.category === "posterior_chain"
    );
    const unilateral = safeExercises.filter(
      (exercise) => exercise.category === "unilateral"
    );
    const isolation = safeExercises.filter(
      (exercise) => exercise.category === "isolation"
    );
    const calves = safeExercises.filter((exercise) => exercise.category === "calves");

    const orderedGoals = [goal, "strength", "hypertrophy", "endurance"].filter(
      (value, index, arr) => arr.indexOf(value) === index
    );

    const workoutOptions = orderedGoals.map((goalOption) =>
      buildWorkoutByGoal({
        goal: goalOption,
        compound,
        posteriorChain,
        unilateral,
        isolation,
        calves,
        allExercises: safeExercises,
        exerciseCount,
        profile,
        avoidIds: lastExerciseIds,
      })
    );

    return res.status(200).json({
      workoutType: "personalised",
      targetArea: "lower_body",
      knowledgeBased: true,
      profileUsed: {
        fitnessLevel,
        goal,
        equipment,
        age,
        injury,
      },
      prescription: {
        exerciseCount,
        note: "Each option represents a different lower-body training goal while respecting user constraints.",
      },
      constraintsApplied: {
        ageAdjusted: age >= 50,
        injuryAware: injury !== "none",
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

// Save whichever personalised option the user chooses
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
      exercises: selectedWorkout.exercises,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save selected workout recommendation",
      error: error.message,
    });
  }
};

// Get all recommendations for this user
const getMyRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(recommendations);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

module.exports = {
  generatePersonalisedWorkoutOptions,
  createSelectedRecommendation,
  getMyRecommendations,
};