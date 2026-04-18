require("dotenv").config({ path: __dirname + "/../.env" });

const connectDB = require("../config/db");
const Exercise = require("../models/Exercise");

const exercises = [
  // COMPOUND - quadriceps
  {
    name: "Barbell Squat",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "gym",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/BBSquat",
  },
  {
    name: "Leg Press",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "gym",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/SLLegPress",
  },
  {
    name: "Goblet Squat",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/DBGobletSquat",
  },
  {
    name: "Bodyweight Squat",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/BWSquat",
  },

  // POSTERIOR CHAIN - hamstrings / glutes
  {
    name: "Romanian Deadlift",
    muscleGroup: "hamstrings",
    category: "posterior_chain",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/Hamstrings/DBRomanianDeadlift",
  },
  {
    name: "Good Morning",
    muscleGroup: "hamstrings",
    category: "posterior_chain",
    equipment: "gym",
    instructionUrl: "https://exrx.net/WeightExercises/Hamstrings/BBGoodMorning",
  },
  {
    name: "Hip Thrust",
    muscleGroup: "glutes",
    category: "posterior_chain",
    equipment: "gym",
    instructionUrl: "https://exrx.net/WeightExercises/GluteusMaximus/BBHipThrust",
  },
  {
    name: "Dumbbell Hip Thrust",
    muscleGroup: "glutes",
    category: "posterior_chain",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/GluteusMaximus/DBHipThrust",
  },
  {
    name: "Glute Bridge",
    muscleGroup: "glutes",
    category: "posterior_chain",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/GluteusMaximus/BWGluteBridge",
  },

  // UNILATERAL
  {
    name: "Walking Lunge",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/BWWalkingLunge",
  },
  {
    name: "Dumbbell Walking Lunge",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/DBWalkingLunge",
  },
  {
    name: "Reverse Lunge",
    muscleGroup: "glutes",
    category: "unilateral",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/GluteusMaximus/BWReverseLunge",
  },
  {
    name: "Dumbbell Reverse Lunge",
    muscleGroup: "glutes",
    category: "unilateral",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/GluteusMaximus/DBReverseLunge",
  },
  {
    name: "Bulgarian Split Squat",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/DBBulgarianSplitSquat",
  },
  {
    name: "Step Up",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/BWStepUp",
  },
  {
    name: "Dumbbell Step Up",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/DBStepUp",
  },
  {
    name: "Single Leg Romanian Deadlift",
    muscleGroup: "hamstrings",
    category: "unilateral",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/Hamstrings/DBSingleLegRomanianDeadlift",
  },
  {
    name: "Curtsy Lunge",
    muscleGroup: "glutes",
    category: "unilateral",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/GluteusMaximus/BWCurtsyLunge",
  },

  // ISOLATION
  {
    name: "Leg Extension",
    muscleGroup: "quadriceps",
    category: "isolation",
    equipment: "gym",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/LVLegExtension",
  },
  {
    name: "Leg Curl",
    muscleGroup: "hamstrings",
    category: "isolation",
    equipment: "gym",
    instructionUrl: "https://exrx.net/WeightExercises/Hamstrings/LVLyingLegCurl",
  },
  {
    name: "Hamstring Curl",
    muscleGroup: "hamstrings",
    category: "isolation",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/Lists/ExList/ThighWt#Hamstrings",
  },
  {
    name: "Glute Kickback",
    muscleGroup: "glutes",
    category: "isolation",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/Lists/ExList/GlWt#GluteusMaximus",
  },
  {
    name: "Frog Pumps",
    muscleGroup: "glutes",
    category: "isolation",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/Lists/ExList/GlWt#GluteusMaximus",
  },
  {
    name: "Wall Sit",
    muscleGroup: "quadriceps",
    category: "isolation",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/Quadriceps/BWWallSit",
  },

  // CALVES
  {
    name: "Standing Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/Gastrocnemius/BWStandingCalfRaise",
  },
  {
    name: "Single Leg Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "bodyweight",
    instructionUrl: "https://exrx.net/WeightExercises/Gastrocnemius/BWSingleLegCalfRaise",
  },
  {
    name: "Dumbbell Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "dumbbells",
    instructionUrl: "https://exrx.net/WeightExercises/Gastrocnemius/DBStandingCalfRaise",
  },
  {
    name: "Seated Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "gym",
    instructionUrl: "https://exrx.net/WeightExercises/Soleus/LVSeatedCalfRaise",
  },
];

const seedExercises = async () => {
  try {
    await connectDB();

    await Exercise.deleteMany({});
    await Exercise.insertMany(exercises);

    console.log(`✅ ${exercises.length} exercises seeded successfully`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding exercises:", error);
    process.exit(1);
  }
};

seedExercises();