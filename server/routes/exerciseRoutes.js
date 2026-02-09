const express = require("express");
const {
  getExercises,
  seedExercises,
} = require("../controllers/exerciseController");

const router = express.Router();

router.get("/", getExercises);
router.post("/seed", seedExercises);

module.exports = router;
