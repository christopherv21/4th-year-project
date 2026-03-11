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

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/workout-logs", workoutLogRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("CV Fitness API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});