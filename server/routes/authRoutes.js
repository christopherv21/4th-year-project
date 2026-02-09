const express = require("express");
const { loginMvp } = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginMvp);

module.exports = router;
