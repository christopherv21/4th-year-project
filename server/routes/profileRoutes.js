const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const { getMyProfile, upsertMyProfile } = require("../controllers/profileController");

// protect all routes below
router.use(requireAuth);

router.get("/", getMyProfile);
router.post("/", upsertMyProfile);

module.exports = router;
