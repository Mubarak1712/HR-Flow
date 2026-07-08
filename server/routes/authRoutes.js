const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", authMiddleware.protect, getProfile);

module.exports = router;