const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");
const { submitFeedback, getEvaluationResults } = require("../controllers/feedbackController");

router.post("/", requireAuth, submitFeedback);
router.get("/summary", requireAuth, getEvaluationResults);

module.exports = router;
