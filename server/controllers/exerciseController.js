const Exercise = require("../models/Exercise");

// Get all exercises from MongoDB
const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ name: 1 });
    res.json(exercises);
  } catch (err) {
    console.error("Error fetching exercises:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Seed some exercises into the DB (run once)
const seedExercises = async (req, res) => {
  try {
    const count = await Exercise.countDocuments();

    if (count > 0) {
      return res.json({ message: "Exercises already seeded" });
    }

    const sampleExercises = [
      { name: "Running (moderate)", kcalPerMinute: 10 },
      { name: "Cycling (easy)", kcalPerMinute: 7 },
      { name: "Push-ups", kcalPerMinute: 8 },
      { name: "Pull-ups", kcalPerMinute: 9 },
      { name: "Squats", kcalPerMinute: 6 },
    ];

    await Exercise.insertMany(sampleExercises);

    res.json({ message: "Sample exercises seeded" });
  } catch (err) {
    console.error("Error seeding exercises:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getExercises, seedExercises };
