const Exercise = require("../models/Exercise");

const seedExercises = async (req, res) => {
  try {
    const exercises = [
      { name: "Barbell Squat", muscleGroup: "quadriceps", category: "compound", equipment: "gym" },
      { name: "Leg Press", muscleGroup: "quadriceps", category: "compound", equipment: "gym" },
      { name: "Romanian Deadlift", muscleGroup: "hamstrings", category: "posterior_chain", equipment: "gym" },
      { name: "Leg Curl", muscleGroup: "hamstrings", category: "isolation", equipment: "gym" },
      { name: "Leg Extension", muscleGroup: "quadriceps", category: "isolation", equipment: "gym" },
      { name: "Standing Calf Raise", muscleGroup: "calves", category: "calves", equipment: "gym" },

      { name: "Goblet Squat", muscleGroup: "quadriceps", category: "compound", equipment: "dumbbells" },
      { name: "Dumbbell Romanian Deadlift", muscleGroup: "hamstrings", category: "posterior_chain", equipment: "dumbbells" },
      { name: "Walking Lunges", muscleGroup: "glutes", category: "unilateral", equipment: "dumbbells" },
      { name: "Bulgarian Split Squat", muscleGroup: "quadriceps", category: "unilateral", equipment: "dumbbells" },
      { name: "Dumbbell Calf Raise", muscleGroup: "calves", category: "calves", equipment: "dumbbells" },

      { name: "Air Squat", muscleGroup: "quadriceps", category: "compound", equipment: "bodyweight" },
      { name: "Glute Bridge", muscleGroup: "glutes", category: "posterior_chain", equipment: "bodyweight" },
      { name: "Bodyweight Lunges", muscleGroup: "quadriceps", category: "unilateral", equipment: "bodyweight" },
      { name: "Wall Sit", muscleGroup: "quadriceps", category: "isolation", equipment: "bodyweight" },
      { name: "Bodyweight Calf Raise", muscleGroup: "calves", category: "calves", equipment: "bodyweight" },
    ];

    await Exercise.deleteMany({});
    const inserted = await Exercise.insertMany(exercises);

    res.status(201).json({
      message: "Lower-body exercises seeded successfully",
      count: inserted.length,
      exercises: inserted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to seed exercises",
      error: error.message,
    });
  }
};

const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ name: 1 });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch exercises",
      error: error.message,
    });
  }
};

module.exports = {
  seedExercises,
  getAllExercises,
};