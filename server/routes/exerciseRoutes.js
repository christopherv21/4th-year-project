const express = require("express");
const router = express.Router();

const {
  seedExercises,
  getAllExercises,
} = require("../controllers/exerciseController");

router.post("/seed", seedExercises);
router.get("/", getAllExercises);

module.exports = router;