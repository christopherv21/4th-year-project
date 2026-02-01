// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Exercise = require('./models/Exercise');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymdb';

mongoose
  .connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

/**
 * Very basic "login" endpoint for MVP
 * Any username is accepted, no password check.
 */
app.post('/api/login', (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === '') {
    return res.status(400).json({ message: 'Username is required' });
  }

  res.json({ message: 'Login successful', username });
});

// Get all exercises from MongoDB
app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ name: 1 });
    res.json(exercises);
  } catch (err) {
    console.error('Error fetching exercises:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed some exercises into the DB (run once)
app.post('/api/seed-exercises', async (req, res) => {
  try {
    const count = await Exercise.countDocuments();

    if (count > 0) {
      return res.json({ message: 'Exercises already seeded' });
    }

    const sampleExercises = [
      { name: 'Running (moderate)', kcalPerMinute: 10 },
      { name: 'Cycling (easy)', kcalPerMinute: 7 },
      { name: 'Push-ups', kcalPerMinute: 8 },
      { name: 'Pull-ups', kcalPerMinute: 9 },
      { name: 'Squats', kcalPerMinute: 6 },
    ];

    await Exercise.insertMany(sampleExercises);

    res.json({ message: 'Sample exercises seeded' });
  } catch (err) {
    console.error('Error seeding exercises:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
