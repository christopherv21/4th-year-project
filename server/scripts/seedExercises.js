require("dotenv").config({ path: __dirname + "/../.env" });

const connectDB = require("../config/db");
const Exercise = require("../models/Exercise");

const exercises = [
  // COMPOUND
  {
    name: "Barbell Squat",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "gym",
    instructions: "Lower your hips back and down, then drive up through your heels to stand.",
  },
  {
    name: "Leg Press",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "gym",
    instructions: "Push the platform away by extending your legs, then return slowly.",
  },
  {
    name: "Goblet Squat",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "dumbbells",
    instructions: "Hold a dumbbell at chest level and squat down, keeping your chest upright.",
  },
  {
    name: "Bodyweight Squat",
    muscleGroup: "quadriceps",
    category: "compound",
    equipment: "bodyweight",
    instructions: "Bend your knees and hips to lower down, then stand back up.",
  },

  // POSTERIOR
  {
    name: "Romanian Deadlift",
    muscleGroup: "hamstrings",
    category: "posterior_chain",
    equipment: "dumbbells",
    instructions: "Hinge at the hips with slight knee bend, then return to standing.",
  },
  {
    name: "Good Morning",
    muscleGroup: "hamstrings",
    category: "posterior_chain",
    equipment: "gym",
    instructions: "Bend forward at the hips with a straight back, then return upright.",
  },
  {
    name: "Hip Thrust",
    muscleGroup: "glutes",
    category: "posterior_chain",
    equipment: "gym",
    instructions: "Drive hips upward by squeezing your glutes, then lower slowly.",
  },
  {
    name: "Dumbbell Hip Thrust",
    muscleGroup: "glutes",
    category: "posterior_chain",
    equipment: "dumbbells",
    instructions: "Push hips upward with a dumbbell on your hips, then lower with control.",
  },
  {
    name: "Glute Bridge",
    muscleGroup: "glutes",
    category: "posterior_chain",
    equipment: "bodyweight",
    instructions: "Lift hips off the ground by squeezing glutes, then lower slowly.",
  },

  // UNILATERAL
  {
    name: "Walking Lunge",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "bodyweight",
    instructions: "Step forward into a lunge, then bring your back leg forward.",
  },
  {
    name: "Dumbbell Walking Lunge",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "dumbbells",
    instructions: "Hold dumbbells and step into lunges, alternating legs.",
  },
  {
    name: "Reverse Lunge",
    muscleGroup: "glutes",
    category: "unilateral",
    equipment: "bodyweight",
    instructions: "Step backward into a lunge, then return to standing.",
  },
  {
    name: "Dumbbell Reverse Lunge",
    muscleGroup: "glutes",
    category: "unilateral",
    equipment: "dumbbells",
    instructions: "Hold dumbbells and step back into a controlled lunge.",
  },
  {
    name: "Bulgarian Split Squat",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "dumbbells",
    instructions: "Lower into a single-leg squat with rear foot elevated, then push up.",
  },
  {
    name: "Step Up",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "bodyweight",
    instructions: "Step onto a platform and drive through your lead leg.",
  },
  {
    name: "Dumbbell Step Up",
    muscleGroup: "quadriceps",
    category: "unilateral",
    equipment: "dumbbells",
    instructions: "Hold dumbbells and step onto a platform, then step down.",
  },
  {
    name: "Single Leg Romanian Deadlift",
    muscleGroup: "hamstrings",
    category: "unilateral",
    equipment: "dumbbells",
    instructions: "Balance on one leg, hinge forward, then return upright.",
  },
  {
    name: "Curtsy Lunge",
    muscleGroup: "glutes",
    category: "unilateral",
    equipment: "bodyweight",
    instructions: "Step one leg diagonally behind and lower into a lunge.",
  },

  // ISOLATION
  {
    name: "Leg Extension",
    muscleGroup: "quadriceps",
    category: "isolation",
    equipment: "gym",
    instructions: "Extend your legs fully, then lower under control.",
  },
  {
    name: "Leg Curl",
    muscleGroup: "hamstrings",
    category: "isolation",
    equipment: "gym",
    instructions: "Curl your legs toward you, then return slowly.",
  },
  {
    name: "Hamstring Curl",
    muscleGroup: "hamstrings",
    category: "isolation",
    equipment: "bodyweight",
    instructions: "Curl your legs by engaging your hamstrings.",
  },
  {
    name: "Glute Kickback",
    muscleGroup: "glutes",
    category: "isolation",
    equipment: "bodyweight",
    instructions: "Kick your leg back while squeezing your glutes.",
  },
  {
    name: "Frog Pumps",
    muscleGroup: "glutes",
    category: "isolation",
    equipment: "bodyweight",
    instructions: "Press hips upward with soles of feet together.",
  },
  {
    name: "Wall Sit",
    muscleGroup: "quadriceps",
    category: "isolation",
    equipment: "bodyweight",
    instructions: "Hold a seated position against a wall.",
  },

  // CALVES
  {
    name: "Standing Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "bodyweight",
    instructions: "Raise your heels off the ground, then lower slowly.",
  },
  {
    name: "Single Leg Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "bodyweight",
    instructions: "Raise one heel off the ground while balancing.",
  },
  {
    name: "Dumbbell Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "dumbbells",
    instructions: "Hold dumbbells and raise your heels upward.",
  },
  {
    name: "Seated Calf Raise",
    muscleGroup: "calves",
    category: "calves",
    equipment: "gym",
    instructions: "Lift your heels while seated, then lower slowly.",
  },
];

const seedExercises = async () => {
  try {
    console.log("🚀 Seeding exercises...");

    await connectDB();
    console.log("✅ MongoDB connected");

    await Exercise.deleteMany({});
    console.log("🗑 Old exercises removed");

    await Exercise.insertMany(exercises);

    console.log(`✅ ${exercises.length} exercises seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding exercises:", error);
    process.exit(1);
  }
};

seedExercises();