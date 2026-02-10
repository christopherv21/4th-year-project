const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api", authRoutes); // /api/login
app.use("/api/exercises", exerciseRoutes); // GET /api/exercises, POST /api/exercises/seed

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
const { requireAuth } = require("./middleware/authMiddleware");

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ message: "You are authenticated", userId: req.userId });
});
