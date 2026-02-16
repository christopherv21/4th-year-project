const router = require("express").Router();

// ✅ Your middleware file is authMiddleware.js (from your folder)
const requireAuth = require("../middleware/authMiddleware");

// ✅ Make sure this file exists at: server/controllers/profileController.js
const { getMyProfile, upsertMyProfile } = require("../controllers/profileController");

// Routes
router.get("/", requireAuth, getMyProfile);
router.post("/", requireAuth, upsertMyProfile);

module.exports = router;
