const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const profileRoutes = require("./routes/profileRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const workoutLogRoutes = require("./routes/workoutLogRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");




// Middleware
const requireAuth = require("./middleware/authMiddleware");

dotenv.config();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// API Routes
app.use("/api", authRoutes);                 // /api/auth/register, /api/auth/login (based on your authRoutes)
app.use("/api/exercises", exerciseRoutes);   // GET /api/exercises, POST /api/exercises/seed
app.use("/api/profile", profileRoutes);      // GET /api/profile, POST /api/profile
app.use("/api/recommendations", recommendationRoutes); // GET /api/recommendations/generate
app.use("/api/workouts", workoutLogRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/evaluation", evaluationRoutes);




// Protected test route
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ message: "You are authenticated", userId: req.userId });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
