const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const {
  upsertProfile,
  getMyProfile,
} = require("../controllers/profileController");

router.get("/me", requireAuth, getMyProfile);
router.post("/", requireAuth, upsertProfile);

module.exports = router;