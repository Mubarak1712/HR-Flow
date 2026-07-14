const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerUser,
  createAdminUser,
  loginUser,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/admin", authMiddleware.protect, authMiddleware.authorize("Admin"), createAdminUser);

router.post("/login", loginUser);

router.get("/profile", authMiddleware.protect, getProfile);
router.put("/change-password", authMiddleware.protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;